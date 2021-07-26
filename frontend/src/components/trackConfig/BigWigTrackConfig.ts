import { TrackConfig } from "./TrackConfig";
import { NumericalTrackConfig } from "./NumericalTrackConfig";
import NumericalTrack, { DEFAULT_OPTIONS } from "../trackVis/commonComponents/numerical/NumericalTrack";
import { BigGmodWorker } from "../../dataSources/WorkerTSHook";
import LocalBigSourceGmod from "../../dataSources/big/LocalBigSourceGmod";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { NumericalFeature } from "../../model/Feature";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import TrackModel from "model/TrackModel";

export class BigWigTrackConfig extends TrackConfig {
    private numericalTrackConfig: NumericalTrackConfig;
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.numericalTrackConfig = new NumericalTrackConfig(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        if (this.trackModel.fileObj) {
            return new LocalBigSourceGmod(this.trackModel.fileObj);
        } else {
            return new WorkerSource(BigGmodWorker, this.trackModel.url);
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
     *
     */
    /**
     *
     * Jul-24-2021 @Daofeng switched to use @gmod/bbi
     */
    formatData(data: any[]) {
        // console.log(data);
        return data.map(
            (feature) =>
                new NumericalFeature("", new ChromosomeInterval(feature.chr, feature.start, feature.end)).withValue(
                    feature.score
                )
            // new NumericalFeature("", new ChromosomeInterval(feature.segment, feature.min, feature.max)).withValue(
            //     feature.score
            // )
        );
    }

    /**
     * @override
     */
    // shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
    //     return oldOptions.zoomLevel !== newOptions.zoomLevel;
    // }

    getComponent() {
        return NumericalTrack;
    }

    getMenuComponents() {
        return [...this.numericalTrackConfig.getMenuComponents()];
    }
}
