import { AnnotationDisplayModeConfig } from "components/trackContextMenu/DisplayModeConfig";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import { TrackModel } from "model/TrackModel";
import Rgbpeak from "model/Rgbpeak";
import RgbpeakTrack, { DEFAULT_OPTIONS } from "./../trackVis/RgbpeakTrack";
import { BigBedTrackConfig } from "./BigBedTrackConfig";
import { BackgroundColorConfig } from "components/trackContextMenu/ColorConfig";
import HiddenPixelsConfig from "components/trackContextMenu/HiddenPixelsConfig";
import HeightConfig from "components/trackContextMenu/HeightConfig";

export class RgbpeakTrackConfig extends BigBedTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }
    /**
     * Converts BedRecords to Rgbpeaks.
     *
     * @param {DasFeature[]} data - DasFeature records to convert
     * @return {Rgbpeak[]} Rgbpeak records
     */
    formatData(data: any[]) {
        return data.map((record) => new Rgbpeak(record));
    }

    getComponent() {
        return RgbpeakTrack;
    }

    getMenuComponents() {
        return [LabelConfig, AnnotationDisplayModeConfig, HeightConfig, BackgroundColorConfig, HiddenPixelsConfig];
    }
}
