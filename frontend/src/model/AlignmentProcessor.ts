import _ from 'lodash';
import { AlignmentRecord } from './AlignmentRecord';
import DisplayedRegionModel from './DisplayedRegionModel';
import LinearDrawingModel from './LinearDrawingModel';
import ChromosomeInterval from './interval/ChromosomeInterval';
import OpenInterval from './interval/OpenInterval';

interface PlacedAlignment {
    record: AlignmentRecord;
    targetXSpan: OpenInterval;
    queryXSpan: OpenInterval;
}

export interface PlacedMergedAlignment {
    queryLocus: ChromosomeInterval;
    queryXSpan: OpenInterval;
    segments: PlacedAlignment[];
}

const MIN_DRAW_WIDTH = 5;
const MARGIN = 5;
const MERGE_PIXEL_DISTANCE = 200;

export class AlignmentProcessor {
    /**
     * Groups and merges alignment records based on their proximity in the query (secondary) genome.  Then, calculates
     * draw positions for all records.
     * 
     * @param {AlignmentRecord[]} alignmentRecords - records to process
     * @param {DisplayedRegionModel} viewRegion - view region of the primary genome
     * @param {number} width - view width of the primary genome
     * @return {PlacedMergedAlignment[]} placed merged alignments
     */
    mergeAndPlaceAlignments(alignmentRecords: AlignmentRecord[], viewRegion: DisplayedRegionModel,
        width: number): PlacedMergedAlignment[]
    {
        if (alignmentRecords.length === 0) {
            return [];
        }

        const navContext = viewRegion.getNavigationContext();
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const basesPerPixel = drawModel.xWidthToBases(1);
        // In other words, MERGE_PIXEL_DISTANCE px worth of bases.
        const mergeDistance = MERGE_PIXEL_DISTANCE * basesPerPixel;

        // First, merge the alignments by query genome coordinates
        let merges = ChromosomeInterval.mergeAdvanced(
            alignmentRecords, mergeDistance, record => record.queryLocus // <-- Merging using the query locus
        );

        // Sort so we place the largest query loci first in the next step
        merges = merges.sort((a, b) => b.locus.getLength() - a.locus.getLength());

        const intervalPlacer = new IntervalPlacer(MARGIN);
        const placements: PlacedMergedAlignment[] = [];
        for (const merge of merges) {
            const mergeLocus = merge.locus; // This is a locus in the query/secondary genome!
            const recordsInMerge = merge.sources; // Records that made the merged locus
            const drawWidth = drawModel.basesToXWidth(mergeLocus.getLength()); // Draw width of the query locus
            if (drawWidth < MIN_DRAW_WIDTH) {
                continue;
            }

            // Step 1: place target/primary genome segments 
            const segments: PlacedAlignment[] = [];
            for (const record of recordsInMerge) {
                const contextSpans = record.computeNavContextCoordinates(navContext);
                for (const span of contextSpans) {
                    segments.push({
                        record,
                        targetXSpan: drawModel.baseSpanToXSpan(span),
                        queryXSpan: null, // We will set these later in step 3
                    });
                }
            }

            // Step 2: using the centroid of the segments from step 1, place the merged query locus.
            const drawCenter = computeCentroid(segments.map(segment => segment.targetXSpan));
            const preferredQueryXSpan = new OpenInterval(drawCenter - 0.5 * drawWidth, drawCenter + 0.5 * drawWidth);
            const queryXSpan = intervalPlacer.place(preferredQueryXSpan);

            // Step 3: using the placed query locus from step 2, place secondary/query genome segments
            for (const segment of segments) {
                const segmentLocus = segment.record.queryLocus;
                const segmentWidth = drawModel.basesToXWidth(segmentLocus.getLength());
                const segmentOffset = drawModel.basesToXWidth(segmentLocus.start - mergeLocus.start);
                const segmentStart = queryXSpan.start + segmentOffset;
                segment.queryXSpan = new OpenInterval(segmentStart, segmentStart + segmentWidth);
            }

            placements.push({ queryLocus: mergeLocus, queryXSpan, segments });
        }

        return placements;
    }

    makeQueryGenomeNavContext(placedAlignments: PlacedMergedAlignment[]): null {
        return null;
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
