import memoizeOne from 'memoize-one';

import { PlacedMergedAlignment, AlignmentPlacer } from './AlignmentPlacer';
import { AlignmentRecord } from './AlignmentRecord';
import { GuaranteeMap } from './GuaranteeMap';
import DisplayedRegionModel from './DisplayedRegionModel';
import { getGenomeConfig } from './genomes/allGenomes';

import DataSource from '../dataSources/DataSource';
import WorkerSource from '../dataSources/worker/WorkerSource';
import { GenomeAlignWorker } from '../dataSources/WorkerTSHook';

export interface Alignment {
    viewRegion: DisplayedRegionModel;
    drawData: PlacedMergedAlignment[];
    isAggregated: boolean;
}

export class AlignmentViewCalculator {
    private _alignmentFetcherForGenome: GuaranteeMap<string, AlignmentFetcher>;

    constructor(primaryGenome: string) {
        const initFetcher = (queryGenome: string) => new AlignmentFetcher(primaryGenome, queryGenome);
        this._alignmentFetcherForGenome = new GuaranteeMap(initFetcher);
    }

    cleanUp() {
        for (const fetcher of this._alignmentFetcherForGenome.values()) {
            fetcher.cleanUp();
        }
    }

    computePrimaryRegion(viewRegion: DisplayedRegionModel, width: number,
        queryGenome: string): Promise<DisplayedRegionModel>
    {
        return Promise.resolve(viewRegion);
    }

    computeSecondaryRegion(fetchRegion: DisplayedRegionModel, drawRegion: DisplayedRegionModel, drawPaneWidth: number,
        queryGenome: string): Promise<Alignment>
    {
        const fetcher = this._alignmentFetcherForGenome.get(queryGenome);
        return fetcher.fetchAlignment(fetchRegion, drawRegion, drawPaneWidth);
    }
}

const ALIGNMENT_PLACER = new AlignmentPlacer();
class AlignmentFetcher {
    private _dataSource: DataSource;
    private _viewBeingFetched: DisplayedRegionModel;

    constructor(public primaryGenome: string, public queryGenome: string) {
        this.primaryGenome = primaryGenome;
        this.queryGenome = queryGenome;
        this._dataSource = this.initDataSource();
        this._viewBeingFetched = null;
        this.fetchAlignment = memoizeOne(this.fetchAlignment);
    }

    cleanUp() {
        if (this._dataSource) {
            this._dataSource.cleanUp();
        }
    }

    initDataSource(): DataSource {
        const errorMessage = `No configuration found for comparison of "${this.primaryGenome}" (primary) and ` +
            `"${this.queryGenome}" (query)`; // Just in case

        const genomeConfig = getGenomeConfig(this.primaryGenome);
        if (!genomeConfig) {
            return new ErrorSource(new Error(errorMessage));
        }
        const annotationTracks = genomeConfig.annotationTracks || {};
        const comparisonTracks = annotationTracks["Genome comparison"] || [];
        const theTrack = comparisonTracks.find((track: any) => track.querygenome === this.queryGenome) || {};
        const url = theTrack.url;
        if (!url) {
            return new ErrorSource(new Error(errorMessage));
        }
        return new WorkerSource(GenomeAlignWorker, url);
    }

    processAlignment(rawRecords: any[], viewRegion: DisplayedRegionModel, width: number) {
        const alignmentRecords = rawRecords.map(record => new AlignmentRecord(record));
        const placedAlignments = ALIGNMENT_PLACER.mergeAndPlaceAlignments(alignmentRecords, viewRegion, width);
        const navContext = ALIGNMENT_PLACER.makeQueryGenomeNavContext(
            placedAlignments, width, viewRegion.getWidth() / width
        );
        return {
            viewRegion: new DisplayedRegionModel(navContext),
            drawData: placedAlignments,
            isAggregated: true
        };
    }

    /**
     * 
     * @param {DisplayedRegionModel} viewRegion - view region in the primary genome
     * @param {number} width 
     */
    async fetchAlignment(fetchRegion: DisplayedRegionModel, drawRegion: DisplayedRegionModel,
        drawPaneWidth: number): Promise<Alignment>
    {
        this._viewBeingFetched = fetchRegion;
        const basesPerPixel = drawRegion.getWidth() / drawPaneWidth;
        const rawRecords: any[] = await this._dataSource.getData(fetchRegion, basesPerPixel);

        if (this._viewBeingFetched !== fetchRegion) { // Another view is being fetched; cancel processing.
            return null;
        }

        const alignmentRecords = rawRecords.map(record => new AlignmentRecord(record));
        const placedAlignments = ALIGNMENT_PLACER.mergeAndPlaceAlignments(alignmentRecords, drawRegion, drawPaneWidth);
        const navContext = ALIGNMENT_PLACER.makeQueryGenomeNavContext(placedAlignments, drawPaneWidth, basesPerPixel);
        return {
            viewRegion: new DisplayedRegionModel(navContext),
            drawData: placedAlignments,
            isAggregated: true
        };
    }
}

class ErrorSource extends DataSource {
    constructor(public error: Error) {
        super();
        this.error = error;
    }

    getData(): never {
        throw this.error;
    }
}
