import { TrackModel } from "./../../model/TrackModel";
import { TrackConfig } from "./TrackConfig";
import QBedTrack, { DEFAULT_OPTIONS } from "../trackVis/QBedTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import LocalBedSource from "../../dataSources/LocalBedSource";
import QBed from "../../model/QBed";
import BedRecord from "../../dataSources/bed/BedRecord";
import BedTextSource from "../../dataSources/BedTextSource";
import HeightConfig from "../trackContextMenu/HeightConfig";
import YscaleConfig from "../trackContextMenu/YscaleConfig";
import LogScaleConfig from "../trackContextMenu/LogScaleConfig";
import DownsamplingChoices from "../trackContextMenu/DownsamplingConfig";
import OpacitySliderConfig from "../trackContextMenu/OpacitySilderConfig";
import MarkerSizeConfig from "../trackContextMenu/MarkerSizeConfig";
import { BackgroundColorConfig, PrimaryColorConfig, SecondaryColorConfig } from "../trackContextMenu/ColorConfig";
import ShowHorizontalLineConfig from "../trackContextMenu/ShowHorizontalLineConfig";
import HorizontalLineValueConfig from "../trackContextMenu/HorizontalLineValueConfig";

export class QBedTrackConfig extends TrackConfig {
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
                return new WorkerSource(BedWorker, this.trackModel.url, this.trackModel.indexUrl);
            }
        }
    }

    /**
     * Converts BedRecords to QBeds.
     *
     * @param {BedRecord[]} data - bed records to convert
     * @return {QBed[]} QBed records
     */
    formatData(data: BedRecord[]) {
        return data.map((record) => new QBed(record));
    }

    getComponent() {
        return QBedTrack;
    }

    getMenuComponents() {
        const items = [
            ...super.getMenuComponents(),
            HeightConfig,
            YscaleConfig,
            LogScaleConfig,
            DownsamplingChoices,
            OpacitySliderConfig,
            MarkerSizeConfig,
            PrimaryColorConfig,
            SecondaryColorConfig,
            BackgroundColorConfig,
            ShowHorizontalLineConfig,
        ];
        if (this.getOptions().showHorizontalLine) {
            items.push(HorizontalLineValueConfig);
        }
        return items;
    }
}
