import { AlignmentRecord } from './AlignmentRecord';
import DisplayedRegionModel from '../DisplayedRegionModel';
import { ViewExpansion } from '../RegionExpander';
import { getGenomeConfig } from '../genomes/allGenomes';

import DataSource from '../../dataSources/DataSource';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { GenomeAlignWorker } from '../../dataSources/WorkerTSHook';

export class AlignmentFetcher {
    private _dataSource: DataSource;

    constructor(public primaryGenome: string, public queryGenome: string) {
        this.primaryGenome = primaryGenome;
        this.queryGenome = queryGenome;
        this._dataSource = this.initDataSource();
    }

    cleanUp() {
        if (this._dataSource) {
            this._dataSource.cleanUp();
        }
    }

    initDataSource(): DataSource {
        const genomeConfig = getGenomeConfig(this.primaryGenome);
        if (!genomeConfig) {
            return this.makeErrorSource();
        }
        const annotationTracks = genomeConfig.annotationTracks || {};
        const comparisonTracks = annotationTracks["Genome comparison"] || [];
        const theTrack = comparisonTracks.find((track: any) => track.querygenome === this.queryGenome) || {};
        const url = theTrack.url;
        if (!url) {
            return this.makeErrorSource();
        }
        return new WorkerSource(GenomeAlignWorker, url);
    }

    makeErrorSource(): DataSource {
        const errorMessage = `No configuration found for comparison of "${this.primaryGenome}" (primary) and ` +
            `"${this.queryGenome}" (query)`; 
        return new ErrorSource(new Error(errorMessage));
    }

    /**
     * 
     * @param {DisplayedRegionModel} viewRegion - view region in the primary genome
     * @param {number} width 
     */
    async fetchAlignment(fetchRegion: DisplayedRegionModel, visData: ViewExpansion,
        isRoughMode=true): Promise<AlignmentRecord[]>
    {
        const {visRegion, visWidth} = visData;
        const basesPerPixel = visRegion.getWidth() / visWidth;
        const rawRecords: any[] = await this._dataSource.getData(fetchRegion, basesPerPixel, {isRoughMode});
        return rawRecords.map(record => new AlignmentRecord(record));
    }
}

class ErrorSource extends DataSource {
    constructor(public error: Error) {
        super();
        this.error = error;
    }

    getData(): Promise<never> {
        return Promise.reject(this.error);
    }
}
