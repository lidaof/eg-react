import MaxRowsConfig from "components/trackContextMenu/MaxRowsConfig";
import { TrackModel } from "model/TrackModel";
import RowHeightConfig from "components/trackContextMenu/RowHeightConfig";
import { BackgroundColorConfig } from "components/trackContextMenu/ColorConfig";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import { TrackConfig } from "./TrackConfig";
import { BedcolorTrack, DEFAULT_OPTIONS } from "../trackVis/bedTrack/BedcolorTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import { ColoredFeature } from "../../model/Feature";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import LocalBedSource from "../../dataSources/LocalBedSource";
import BedTextSource from "../../dataSources/BedTextSource";
import HiddenPixelsConfig from "../trackContextMenu/HiddenPixelsConfig";

export class BedcolorTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        if (this.trackModel.isText) {
            return new BedTextSource({
                url: this.trackModel.url,
                blob: this.trackModel.fileObj,
                textConfig: this.trackModel.textConfig,
            });
        } else {
            if (this.trackModel.files.length > 0) {
                return new LocalBedSource(this.trackModel.files);
            } else {
                return new WorkerSource(BedWorker, this.trackModel.url);
            }
        }
    }

    /**
     * Converts BedRecords to Features.
     *
     * @param {BedRecord[]} data - bed records to convert
     * @return {ColoredFeature[]} bed records in the form of Feature
     */
    formatData(data: BedRecord[]) {
        return data.map((record) =>
            new ColoredFeature("", new ChromosomeInterval(record.chr, record.start, record.end), "+").withColor(
                record[3]
            )
        );
    }

    getComponent() {
        return BedcolorTrack;
    }

    getMenuComponents() {
        return [LabelConfig, RowHeightConfig, MaxRowsConfig, HiddenPixelsConfig, BackgroundColorConfig];
    }
}
