import { TrackModel } from './../../model/TrackModel';
import { TrackConfig } from './TrackConfig';
import RulerTrack, {DEFAULT_OPTIONS} from '../trackVis/ImportanceTrack';
import { BigWorker } from '../../dataSources/WorkerTSHook';
import LocalBigSource from '../../dataSources/big/LocalBigSource';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { NumericalFeature } from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';



export class ImportanceTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS)
    }

    initDataSource() {
        if (this.trackModel.fileObj) {
            return new LocalBigSource(this.trackModel.fileObj);
        } else {
            return new WorkerSource(BigWorker, this.trackModel.url);
        }
    }

    /*
    Expected DASFeature schema

    interface DASFeature {
        max: number; // Chromosome base number, end
        maxScore: number;
        min: number; // Chromosome base number, start
        score: number; // Value at the location
        segment: string; // Chromosome name
        type: string;
        _chromId: number
    */
    /**
     * Converter of DASFeatures to NumericalFeature.
     * 
     * @param {DASFeature[]} data - DASFeatures to convert
     * @return {NumericalFeature[]} NumericalFeatures made from the input
     */
    formatData(data: any[]) {
        console.debug("IM HERE");
        return data.map(feature =>
            new NumericalFeature("", new ChromosomeInterval(feature.segment, feature.min, feature.max))
                .withValue(feature.score)
        );
    }

    getComponent() {
        return RulerTrack;
    }
}