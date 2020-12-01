import { AnnotationDisplayModes } from "./../../model/DisplayModes";
import { AnnotationDisplayModeConfig } from "components/trackContextMenu/DisplayModeConfig";
import { BackgroundColorConfig } from "components/trackContextMenu/ColorConfig";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import OmeroTrack from "../trackVis/imageTrack/OmeroTrack";
import { DEFAULT_OPTIONS } from "../trackVis/imageTrack/OmeroTrack";
import { TrackModel } from "../../model/TrackModel";
import LocalBedSource from "../../dataSources/LocalBedSource";
import BedTextSource from "../../dataSources/BedTextSource";
import ImageRecord from "model/ImageRecord";
import { TrackConfig } from "./TrackConfig";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import OmeroImageHeightConfig from "components/trackContextMenu/OmeroImageHeightConfig";
import HeightConfig from "components/trackContextMenu/HeightConfig";

export class OmeroTrackConfig extends TrackConfig {
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

    formatData(data: BedRecord[]) {
        return data.map((record) => new ImageRecord(record));
    }

    getMenuComponents() {
        const items = [LabelConfig, AnnotationDisplayModeConfig];
        if (this.getOptions().displayMode === AnnotationDisplayModes.DENSITY) {
            items.push(HeightConfig);
        } else {
            // Assume FULL display mode
            items.push(OmeroImageHeightConfig);
        }
        items.push(BackgroundColorConfig);
        return items;
    }

    getComponent() {
        return OmeroTrack;
    }
}
