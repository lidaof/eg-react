import _ from 'lodash';
import memoizeOne from 'memoize-one';

import { segmentSequence, makeBaseNumberLookup, countBases, SequenceSegment } from './AlignmentStringUtils';
import { AlignmentRecord } from './AlignmentRecord';
import { AlignmentSegment } from './AlignmentSegment';
import { AlignmentFetcher } from './AlignmentFetcher';
import { NavContextBuilder, Gap } from './NavContextBuilder';

import ChromosomeInterval from '../interval/ChromosomeInterval';
import OpenInterval from '../interval/OpenInterval';
import NavigationContext from '../NavigationContext';
import LinearDrawingModel from '../LinearDrawingModel';
import { Feature } from '../Feature';
import { ViewExpansion } from '../RegionExpander';
import { FeaturePlacer } from '../FeaturePlacer';
import DisplayedRegionModel from '../DisplayedRegionModel';

export interface PlacedAlignment {
    record: AlignmentRecord;
    visiblePart: AlignmentSegment;
    contextSpan: OpenInterval;
    targetXSpan: OpenInterval;
    queryXSpan: OpenInterval;
    targetSegments?: PlacedSequenceSegment[]; // These only present in fine mode
    querySegments?: PlacedSequenceSegment[];
}

export interface PlacedSequenceSegment extends SequenceSegment {
    xSpan: OpenInterval;
}

interface QueryGenomePiece {
    queryLocus: ChromosomeInterval;
    queryXSpan: OpenInterval;
}

export interface PlacedMergedAlignment extends QueryGenomePiece {
    segments: PlacedAlignment[];
}

export interface Alignment {
    isFineMode: boolean; // Display mode
    primaryVisData: ViewExpansion; // Primary genome view region data
    queryRegion: DisplayedRegionModel; // Query genome view region
    /**
     * PlacedAlignment[] in fine mode; PlacedMergedAlignment in rough mode.
     */
    drawData: PlacedAlignment[] | PlacedMergedAlignment[];
}

const MARGIN = 5;
const MIN_GAP_DRAW_WIDTH = 3;
const MERGE_PIXEL_DISTANCE = 200;
const MIN_MERGE_DRAW_WIDTH = 5;
const FEATURE_PLACER = new FeaturePlacer();

export class AlignmentViewCalculator {
    private _alignmentFetcher: AlignmentFetcher;
    private _viewBeingFetched: ViewExpansion;

    constructor(primaryGenome: string, queryGenome: string) {
        this._alignmentFetcher = new AlignmentFetcher(primaryGenome, queryGenome);
        this._viewBeingFetched = null;
        this.align = memoizeOne(this.align);
    }

    cleanUp() {
        this._alignmentFetcher.cleanUp();
    }

    async align(visData: ViewExpansion): Promise<Alignment> {
        this._viewBeingFetched = visData;
        const records = await this._alignmentFetcher.fetchAlignment(visData.visRegion, visData);
        if (this._viewBeingFetched !== visData) {
            return Promise.reject(new Error('Alignment canceled due to another call to align()'));
        }
        return this.alignFine(records, visData);
    }

    alignFine(records: AlignmentRecord[], visData: ViewExpansion): Alignment {
        // There's a lot of steps, so bear with me...
        const {visRegion, visWidth, viewWindow, viewWindowRegion} = visData;
        const oldNavContext = visRegion.getNavigationContext();
        const drawModel = new LinearDrawingModel(visRegion, visWidth);
        const minGapLength = drawModel.xWidthToBases(MIN_GAP_DRAW_WIDTH);

        // Calculate context coordinates of the records and gaps within.
        const placements = this._computeContextLocations(records, visData);
        const primaryGaps = this._getPrimaryGenomeGaps(placements, minGapLength);

        // Build a new primary navigation context using the gaps
        const navContextBuilder = new NavContextBuilder(oldNavContext);
        navContextBuilder.setGaps(primaryGaps);
        const newNavContext = navContextBuilder.build();

        // Calculate new DisplayedRegionModel and LinearDrawingModel from the new nav context
        const newVisRegion = convertOldVisRegion(visRegion);
        const newViewWindowRegion = convertOldVisRegion(viewWindowRegion);
        const newPixelsPerBase = viewWindow.getLength() / newViewWindowRegion.getWidth();
        const newVisWidth = newVisRegion.getWidth() * newPixelsPerBase;
        const newDrawModel = new LinearDrawingModel(newVisRegion, newVisWidth);
        const newViewWindow = newDrawModel.baseSpanToXSpan(newViewWindowRegion.getContextCoordinates());

        // With the draw model, we can set x spans for each placed alignment
        for (const placement of placements) {
            const oldContextSpan = placement.contextSpan;
            const visiblePart = placement.visiblePart;
            const newContextSpan = new OpenInterval(
                navContextBuilder.convertOldCoordinates(oldContextSpan.start),
                navContextBuilder.convertOldCoordinates(oldContextSpan.end)
            );
            const xSpan = newDrawModel.baseSpanToXSpan(newContextSpan);
            const targetSeq = visiblePart.getTargetSequence();
            const querySeq = visiblePart.getQuerySequence();

            placement.contextSpan = newContextSpan;
            placement.targetXSpan = xSpan;
            placement.queryXSpan = xSpan;
            placement.targetSegments = this._placeSequenceSegments(targetSeq, minGapLength, xSpan.start, newDrawModel);
            placement.querySegments = this._placeSequenceSegments(querySeq, minGapLength, xSpan.start, newDrawModel);
        }

        // Finally, using the x coordinates, construct the query nav context
        const queryPieces = this._getQueryPieces(placements);
        const queryRegion = this._makeQueryGenomeRegion(queryPieces, newVisWidth, newDrawModel);

        return {
            isFineMode: true,
            primaryVisData: {
                visRegion: newVisRegion,
                visWidth: newVisWidth,
                viewWindowRegion: newViewWindowRegion,
                viewWindow: newViewWindow,
            },
            queryRegion,
            drawData: placements
        };

        function convertOldVisRegion(visRegion: DisplayedRegionModel) {
            const [contextStart, contextEnd] = visRegion.getContextCoordinates();
            return new DisplayedRegionModel(
                newNavContext,
                navContextBuilder.convertOldCoordinates(contextStart),
                navContextBuilder.convertOldCoordinates(contextEnd)
            );
        }
    }

    /**
     * Groups and merges alignment records based on their proximity in the query (secondary) genome.  Then, calculates
     * draw positions for all records.
     * 
     * @param {AlignmentRecord[]} alignmentRecords - records to process
     * @param {DisplayedRegionModel} viewRegion - view region of the primary genome
     * @param {number} width - view width of the primary genome
     * @return {PlacedMergedAlignment[]} placed merged alignments
     */
    alignRough(alignmentRecords: AlignmentRecord[], visData: ViewExpansion): Alignment {
        const {visRegion, visWidth} = visData;
        const drawModel = new LinearDrawingModel(visRegion, visWidth);
        const mergeDistance = drawModel.xWidthToBases(MERGE_PIXEL_DISTANCE);

        // First, merge the alignments by query genome coordinates
        let queryLocusMerges = ChromosomeInterval.mergeAdvanced(
            alignmentRecords, mergeDistance, record => record.queryLocus // <-- Merging using the query locus
        );

        // Sort so we place the largest query loci first in the next step
        queryLocusMerges = queryLocusMerges.sort((a, b) => b.locus.getLength() - a.locus.getLength());

        const intervalPlacer = new IntervalPlacer(MARGIN);
        const drawData: PlacedMergedAlignment[] = [];
        for (const merge of queryLocusMerges) {
            const mergeLocus = merge.locus;
            const recordsInMerge = merge.sources; // Records that made the merged locus
            const mergeDrawWidth = drawModel.basesToXWidth(mergeLocus.getLength());
            const halfDrawWidth = 0.5 * mergeDrawWidth;
            if (mergeDrawWidth < MIN_MERGE_DRAW_WIDTH) {
                continue;
            }

            // Step 1: place target/primary genome segments 
            const placementsInsideMerge = this._computeContextLocations(recordsInMerge, visData);
            for (const placement of placementsInsideMerge) {
                placement.targetXSpan = drawModel.baseSpanToXSpan(placement.contextSpan);
                // We will set queryXSpan in a moment
            }

            // Step 2: using the centroid of the segments from step 1, place the merged query locus.
            const drawCenter = computeCentroid(placementsInsideMerge.map(segment => segment.targetXSpan));
            const preferredStart = drawCenter - halfDrawWidth;
            const preferredEnd = drawCenter + halfDrawWidth;
            const mergeXSpan = intervalPlacer.place(new OpenInterval(preferredStart, preferredEnd));

            // Step 3: using the placed merge locus from step 2, place secondary/query genome segments
            const lociInMerge = placementsInsideMerge.map(placement => placement.record.queryLocus);
            const lociXSpans = this._placeInternalLoci(mergeLocus, lociInMerge, mergeXSpan.start, drawModel);
            for (let i = 0; i < lociInMerge.length; i++) {
                placementsInsideMerge[i].queryXSpan = lociXSpans[i];
            }

            drawData.push({
                queryLocus: mergeLocus,
                queryXSpan: mergeXSpan,
                segments: placementsInsideMerge
            });
        }

        return {
            isFineMode: false,
            primaryVisData: visData,
            queryRegion: this._makeQueryGenomeRegion(drawData, visWidth, drawModel),
            drawData,
        };
    }

    /**
     * Calculates context coordinates in the *primary* genome for alignment records.  Returns PlacedAlignments with NO x
     * coordinates set.  Make sure you set them before returning them in any public API!
     * 
     * @param records 
     * @param visData 
     */
    _computeContextLocations(records: AlignmentRecord[], visData: ViewExpansion): PlacedAlignment[] {
        const {visRegion, visWidth} = visData;
        return FEATURE_PLACER.placeFeatures(records, visRegion, visWidth).map(placement => {
            return {
                record: placement.feature as AlignmentRecord,
                visiblePart: AlignmentSegment.fromFeatureSegment(placement.visiblePart),
                contextSpan: placement.contextLocation,
                targetXSpan: null,
                queryXSpan: null,
            };
        });
    }

    /**
     * 
     * @param placedAlignment 
     * @param minGapLength 
     */
    _getPrimaryGenomeGaps(placements: PlacedAlignment[], minGapLength: number): Gap[] {
        const gaps = [];
        for (const placement of placements) {
            const {visiblePart, contextSpan} = placement;
            const segments = segmentSequence(visiblePart.getTargetSequence(), minGapLength, true);
            const baseLookup = makeBaseNumberLookup(visiblePart.getTargetSequence(), contextSpan.start);
            for (const segment of segments) {
                gaps.push({
                    contextBase: baseLookup[segment.index],
                    length: segment.length
                });
            }
        }
        return gaps;
    }

    _placeSequenceSegments(sequence: string, minGapLength: number, startX: number, drawModel: LinearDrawingModel) {
        const segments = segmentSequence(sequence, minGapLength);
        segments.sort((a, b) => a.index - b.index);
        let x = startX;
        for (const segment of segments) {
            const bases = segment.isGap ? segment.length : countBases(sequence.substr(segment.index, segment.length));
            const xSpanLength = drawModel.basesToXWidth(bases);
            (segment as PlacedSequenceSegment).xSpan = new OpenInterval(x, x + xSpanLength);
            x += xSpanLength;
        }
        return (segments as PlacedSequenceSegment[]);
    }

    /**
     * 
     * @param placements 
     * @param minGapLength 
     * @param pixelsPerBase 
     */
    _getQueryPieces(placements: PlacedAlignment[]): QueryGenomePiece[] {
        const queryPieces: QueryGenomePiece[] = [];
        for (const placement of placements) {
            const {record, visiblePart} = placement;
            const querySeq = visiblePart.getQuerySequence()
            const baseLookup = makeBaseNumberLookup(querySeq, visiblePart.getQueryLocus().start);
            const queryChr = record.queryLocus.chr;
            for (const segment of placement.querySegments) {
                const {isGap, index, length, xSpan} = segment;
                if (isGap) {
                    continue;
                }
                const base = baseLookup[index];
                const locusLength = countBases(querySeq.substr(index, length));
                const segmentLocus = new ChromosomeInterval(queryChr, base, base + locusLength);
                queryPieces.push({ queryLocus: segmentLocus, queryXSpan: xSpan });
            }
        }

        return queryPieces;
    }

    _makeQueryGenomeRegion(genomePieces: QueryGenomePiece[], visWidth: number,
        drawModel: LinearDrawingModel): DisplayedRegionModel
    {
        // Sort by start
        const sortedPieces = genomePieces.slice().sort((a, b) => a.queryXSpan.start - b.queryXSpan.start);
        const features = [];
        let x = 0;
        for (const piece of sortedPieces) {
            const basesFromPrevFeature = Math.round(drawModel.xWidthToBases(piece.queryXSpan.start - x));
            if (basesFromPrevFeature > 0) {
                features.push(NavigationContext.makeGap(basesFromPrevFeature));
            }
            features.push(new Feature(undefined, piece.queryLocus));
            x = piece.queryXSpan.end;
        }
        const finalGapBases = Math.round(drawModel.xWidthToBases(visWidth - x));
        if (finalGapBases > 0) {
            features.push(NavigationContext.makeGap(finalGapBases));
        }
        return new DisplayedRegionModel( new NavigationContext('', features) );
    }

    _placeInternalLoci(parentLocus: ChromosomeInterval, internalLoci: ChromosomeInterval[], parentXStart: number,
        drawModel: LinearDrawingModel)
    {
        const xSpans = [];
        for (const locus of internalLoci) {
            const distanceFromParent = locus.start - parentLocus.start;
            const xDistanceFromParent = drawModel.basesToXWidth(distanceFromParent);
            const xStart = parentXStart + xDistanceFromParent;
            const xWidth = drawModel.basesToXWidth(locus.getLength());
            xSpans.push(new OpenInterval(xStart, xStart + xWidth));
        }
        return xSpans;
    }
}

class IntervalPlacer {
    public leftExtent: number;
    public rightExtent: number;
    public margin: number;
    private _placements: OpenInterval[];

    constructor(margin=0) {
        this.leftExtent = Infinity;
        this.rightExtent = -Infinity;
        this.margin = margin;
        this._placements = [];
    }

    place(preferredLocation: OpenInterval) {
        let finalLocation = preferredLocation;
        if (this._placements.some(placement => placement.getOverlap(preferredLocation) != null)) {
            const center = 0.5 * (preferredLocation.start + preferredLocation.end)
            const isInsertLeft = Math.abs(center - this.leftExtent) < Math.abs(center - this.rightExtent);
            finalLocation = isInsertLeft ?
                new OpenInterval(this.leftExtent - preferredLocation.getLength(), this.leftExtent) :
                new OpenInterval(this.rightExtent, this.rightExtent + preferredLocation.getLength());
        }

        this._placements.push(finalLocation);
        if (finalLocation.start < this.leftExtent) {
            this.leftExtent = finalLocation.start - this.margin;
        }
        if (finalLocation.end > this.rightExtent) {
            this.rightExtent = finalLocation.end + this.margin;
        }

        return finalLocation;
    }

    retrievePlacements() {
        return this._placements;
    }
}

function computeCentroid(intervals: OpenInterval[]) {
    const numerator = _.sumBy(intervals, interval => 0.5 * interval.getLength() * (interval.start + interval.end));
    const denominator = _.sumBy(intervals, interval => interval.getLength());
    return numerator / denominator;
}
