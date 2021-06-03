import { TrackConfig } from "./TrackConfig";
import { NumericalTrackConfig } from "./NumericalTrackConfig";
import NumericalTrack, { DEFAULT_OPTIONS } from "../trackVis/commonComponents/numerical/NumericalTrack";
import { BigWorker } from "../../dataSources/WorkerTSHook";
import LocalBigSource from "../../dataSources/big/LocalBigSource";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { NumericalFeature } from "../../model/Feature";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import { BigWigZoomLevelConfig } from "components/trackContextMenu/DisplayModeConfig";
import TrackModel, { TrackOptions } from "model/TrackModel";

export class BigWigTrackConfig extends TrackConfig {
    private numericalTrackConfig: NumericalTrackConfig;
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.numericalTrackConfig = new NumericalTrackConfig(trackModel);
        this.setDefaultOptions({ ...DEFAULT_OPTIONS, zoomLevel: "auto" });
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
        return data.map((feature) =>
            new NumericalFeature("", new ChromosomeInterval(feature.segment, feature.min, feature.max)).withValue(
                feature.score
            )
        );
    }

    /**
     * @override
     */
    shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
        return oldOptions.zoomLevel !== newOptions.zoomLevel;
    }

    getComponent() {
        return NumericalTrack;
    }

    getMenuComponents() {
        return [...this.numericalTrackConfig.getMenuComponents(), BigWigZoomLevelConfig];
    }
}
