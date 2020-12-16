import { TrackModel } from 'model/TrackModel';
import { GenomeConfig } from "./../genomes/GenomeConfig";
import { AlignmentRecord } from "./AlignmentRecord";
import DisplayedRegionModel from "../DisplayedRegionModel";
import { ViewExpansion } from "../RegionExpander";
// import { getGenomeConfig } from "../genomes/allGenomes";

import DataSource from "../../dataSources/DataSource";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { GenomeAlignWorker } from "../../dataSources/WorkerTSHook";

export class AlignmentFetcher {
    public primaryGenome: string;
    private _dataSource: DataSource;
    public queryTrack: TrackModel;
    public queryGenome: string;

    constructor(public primaryGenomeConfig: GenomeConfig, public track: TrackModel) {
        this.primaryGenome = primaryGenomeConfig.genome.getName();
        this.primaryGenomeConfig = primaryGenomeConfig;
        this.queryTrack = track;
        this.queryGenome = track.querygenome || track.getMetadata("genome");
        this._dataSource = this.initDataSource();
    }

    cleanUp() {
        if (this._dataSource) {
            this._dataSource.cleanUp();
        }
    }

    initDataSource(): DataSource {
        // const genomeConfig = getGenomeConfig(this.primaryGenome);
        if (!this.primaryGenomeConfig) {
            return this.makeErrorSource();
        }
        // const annotationTracks = this.primaryGenomeConfig.annotationTracks || {};
        // const comparisonTracks = annotationTracks["Genome Comparison"] || [];
        // const theTrack = comparisonTracks.find((track: any) => track.querygenome === this.queryGenome) || {};
        const url = this.queryTrack.url;
        if (!url) {
            return this.makeErrorSource();
        }
        return new WorkerSource(GenomeAlignWorker, url);
    }

    makeErrorSource(): DataSource {
        const errorMessage =
            `No configuration found for comparison of "${this.primaryGenome}" (primary) and ` +
            `"${this.queryGenome}" (query)`;
        return new ErrorSource(new Error(errorMessage));
    }

    /**
     *
     * @param {DisplayedRegionModel} viewRegion - view region in the primary genome
     * @param {number} width
     */
    async fetchAlignment(
        fetchRegion: DisplayedRegionModel,
        visData: ViewExpansion,
        isRoughMode = true
    ): Promise<AlignmentRecord[]> {
        const { visRegion, visWidth } = visData;
        const basesPerPixel = visRegion.getWidth() / visWidth;
        const rawRecords: any[] = await this._dataSource.getData(fetchRegion, basesPerPixel, { isRoughMode });
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
