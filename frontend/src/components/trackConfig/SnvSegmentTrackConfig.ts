import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import { SnvSegmentTrack, DEFAULT_OPTIONS } from "../trackVis/SnvSegmentTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import LocalBedSource from "../../dataSources/LocalBedSource";
import HiddenPixelsConfig from "../trackContextMenu/HiddenPixelsConfig";
import SnvSegment from "../../model/SnvSegment";
import TrackModel from "../../model/TrackModel";
import RowHeightConfig from "components/trackContextMenu/RowHeightConfig";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import { AnnotationDisplayModeConfig } from "components/trackContextMenu/DisplayModeConfig";
import { BackgroundColorConfig } from "components/trackContextMenu/ColorConfig";

export class SnvSegmentTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        if (this.trackModel.files.length > 0) {
            return new LocalBedSource(this.trackModel.files);
        } else {
            return new WorkerSource(BedWorker, this.trackModel.url, this.trackModel.indexUrl);
        }
    }

    /**
     * Converts BedRecords to SnvSegments.
     *
     * @param {BedRecord[]} data - bed records to convert
     * @return {SnvSegment[]} SnvSegment records
     */
    formatData(data: BedRecord[]) {
        return data.map((record) => new SnvSegment(record));
    }

    getComponent() {
        return SnvSegmentTrack;
    }

    getMenuComponents() {
        return [LabelConfig, AnnotationDisplayModeConfig, BackgroundColorConfig, RowHeightConfig, HiddenPixelsConfig];
    }
}
