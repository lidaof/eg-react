import { GmodBbiBigBedFeature, Rmskv2Feature } from "../../model/Rmskv2Feature";
import { TrackConfig } from "./TrackConfig";
import Rmskv2Source from "../../dataSources/Rmskv2Source";

import RepeatMaskerTrack, { DEFAULT_OPTIONS, MAX_BASES_PER_PIXEL } from "../trackVis/RepeatMaskerTrack";

import { BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import { AnnotationDisplayModeConfig } from "../trackContextMenu/DisplayModeConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";

import { TrackModel } from "../../model/TrackModel";
import HiddenPixelsConfig from "../trackContextMenu/HiddenPixelsConfig";

export class Rmskv2TrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new Rmskv2Source(this.trackModel.url, MAX_BASES_PER_PIXEL);
    }

    formatData(data: GmodBbiBigBedFeature[]) {
        return data.map((feature) => new Rmskv2Feature(feature));
    }

    getComponent() {
        return RepeatMaskerTrack;
    }

    getMenuComponents() {
        return [
            ...super.getMenuComponents(),
            AnnotationDisplayModeConfig,
            HeightConfig,
            BackgroundColorConfig,
            HiddenPixelsConfig,
        ];
    }
}
