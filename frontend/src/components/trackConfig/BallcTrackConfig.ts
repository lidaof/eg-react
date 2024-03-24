import { TrackConfig } from "./TrackConfig";
import MethylCTrack, { DEFAULT_OPTIONS } from "../trackVis/MethylCTrack";
import { BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";
import MaxMethylAndDepthFilterConfig from "../trackContextMenu/MaxMethylAndDepthFilterConfig";
import { ReadDepthColorConfig } from "../trackContextMenu/MethylColorConfig";
import { TrackModel } from "../../model/TrackModel";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BallcWorker } from "../../dataSources/WorkerTSHook";
import BallcRecord, { BallcItem } from "../../model/BallcRecord";

export class BallcTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions({...DEFAULT_OPTIONS, isCombineStrands: true});
    }

    initDataSource() {
        return new WorkerSource(BallcWorker, this.trackModel.url);
    }

    /**
     * Converts BedRecords to MethylCRecords.
     *
     * @param {BallcItem[]} data - BedRecords to convert
     * @return {BallcRecord[]} MethylCRecords made from the input
     */
    formatData(data: BallcItem[]) {
        return data.map((item) => new BallcRecord(item));
    }

    getMenuComponents() {
        return [
            ...super.getMenuComponents(),
            HeightConfig,
            MaxMethylAndDepthFilterConfig,
            ReadDepthColorConfig,
            BackgroundColorConfig,
        ];
    }

    getComponent() {
        return MethylCTrack;
    }
}
