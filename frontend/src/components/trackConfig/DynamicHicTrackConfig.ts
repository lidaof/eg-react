import LabelConfig from "../trackContextMenu/LabelConfig";
import { TrackConfig } from "./TrackConfig";

import DynamicInteractionTrack, { DEFAULT_OPTIONS } from "../trackVis/interactionTrack/DynamicInteractionTrack";

import { HicSource } from "../../dataSources/HicSource";
import { TrackModel, TrackOptions } from "../../model/TrackModel";
import { BinSize, NormalizationMode } from "../../model/HicDataModes";

import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import ScoreConfig from "../trackContextMenu/ScoreConfig";
import { BinSizeConfig, HicNormalizationConfig } from "../trackContextMenu/HicDataConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";

export class DynamicHicTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions({
            ...DEFAULT_OPTIONS,
            binSize: BinSize.AUTO,
            normalization: NormalizationMode.NONE
        });
    }

    initDataSource() {
        if (this.trackModel.fileObj) {
            return new HicSource(this.trackModel.fileObj);
        } else {
            return new HicSource(this.trackModel.url);
        }
    }

    /**
     * @override
     */
    shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
        return oldOptions.normalization !== newOptions.normalization || oldOptions.binSize !== newOptions.binSize;
    }

    getComponent() {
        return DynamicInteractionTrack;
    }

    getMenuComponents() {
        const items = [
            LabelConfig,
            HicNormalizationConfig,
            HeightConfig,
            ScoreConfig,
            BinSizeConfig,
            PrimaryColorConfig,
            SecondaryColorConfig,
            BackgroundColorConfig
        ];
        return items;
    }
}
