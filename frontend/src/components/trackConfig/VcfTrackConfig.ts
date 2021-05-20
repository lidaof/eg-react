import { TrackConfig } from "./TrackConfig";
import { VcfTrack, DEFAULT_OPTIONS } from "../trackVis/vcfTrack/VcfTrack";
import VcfSource from "../../dataSources/VcfSource";
import Vcf from "model/Vcf";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import MaxRowsConfig from "components/trackContextMenu/MaxRowsConfig";
import {
    highValueColorConfig,
    lowValueColorConfig,
    BackgroundColorConfig,
} from "components/trackContextMenu/ColorConfig";
import RowHeightConfig from "components/trackContextMenu/RowHeightConfig";
import AlwaysDrawLabelConfig from "components/trackContextMenu/AlwaysDrawLabelConfig";
import TrackModel from "model/TrackModel";
import { VcfColorScaleKeyConfig, VcfDisplayModeConfig } from "components/trackContextMenu/DisplayModeConfig";

export class VcfTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        if (this.trackModel.files.length > 0) {
            return new VcfSource(this.trackModel.files);
        } else {
            return new VcfSource(this.trackModel.url);
        }
    }

    /**
     * Converts variant to Vcf Features.
     *
     * @param {VcfRecord[]} data - vcf records as variant to convert
     * @return {Feature[]} vcf records in the form of Feature
     */
    formatData(data: any[]) {
        return data.map((record) => new Vcf(record));
    }

    getComponent() {
        return VcfTrack;
    }

    getMenuComponents() {
        return [
            LabelConfig,
            VcfDisplayModeConfig,
            VcfColorScaleKeyConfig,
            highValueColorConfig,
            lowValueColorConfig,
            BackgroundColorConfig,
            RowHeightConfig,
            MaxRowsConfig,
            AlwaysDrawLabelConfig,
        ];
    }
}
