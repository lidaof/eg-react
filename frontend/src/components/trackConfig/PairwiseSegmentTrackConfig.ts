import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import { PairwiseSegmentTrack, DEFAULT_OPTIONS } from "../trackVis/PairwiseSegmentTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import LocalBedSource from "../../dataSources/LocalBedSource";
import HiddenPixelsConfig from "../trackContextMenu/HiddenPixelsConfig";
import PairwiseSegment from "../../model/PairwiseSegment";
import TrackModel from "../../model/TrackModel";

export class PairwiseSegmentTrackConfig extends AnnotationTrackConfig {
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
     * Converts BedRecords to PairwiseSegments.
     *
     * @param {BedRecord[]} data - bed records to convert
     * @return {PairwiseSegment[]} PairwiseSegment records
     */
    formatData(data: BedRecord[]) {
        return data.map((record) => new PairwiseSegment(record));
    }

    getComponent() {
        return PairwiseSegmentTrack;
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), HiddenPixelsConfig];
    }
}
