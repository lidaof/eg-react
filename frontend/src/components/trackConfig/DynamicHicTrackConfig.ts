import LabelConfig from "../trackContextMenu/LabelConfig";
import { TrackConfig } from "./TrackConfig";

import DynamicInteractionTrack, { DEFAULT_OPTIONS } from "../trackVis/interactionTrack/DynamicInteractionTrack";

// import { HicSource } from "../../dataSources/HicSource";
import { TrackModel, TrackOptions } from "../../model/TrackModel";
import { BinSize, NormalizationMode } from "../../model/HicDataModes";

import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import ScoreConfig from "../trackContextMenu/ScoreConfig";
import { BinSizeConfig, HicNormalizationConfig } from "../trackContextMenu/HicDataConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";
import MatplotSource from "../../dataSources/MatplotSource";
import PlayingConfig from "components/trackContextMenu/PlayingConfig";
import SpeedConfig from "components/trackContextMenu/SpeedConfig";
import { DynamicInteractionDisplayModeConfig } from "components/trackContextMenu/DisplayModeConfig";
import LineWidthConfig from "components/trackContextMenu/LineWidthConfig";
import { DynamicInteractionDisplayMode } from "model/DisplayModes";

export class DynamicHicTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        const options = {
            ...DEFAULT_OPTIONS,
            binSize: BinSize.AUTO,
            normalization: NormalizationMode.NONE,
        };
        this.setDefaultOptions(options);
    }

    initDataSource() {
        return new MatplotSource(this.trackModel);
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
            DynamicInteractionDisplayModeConfig,
            PlayingConfig,
            SpeedConfig,
            HicNormalizationConfig,
            HeightConfig,
            ScoreConfig,
            BinSizeConfig,
            PrimaryColorConfig,
            SecondaryColorConfig,
            BackgroundColorConfig,
        ];
        if (this.getOptions().displayMode !== DynamicInteractionDisplayMode.HEATMAP) {
            items.splice(2, 0, LineWidthConfig);
        }

        return items;
    }
}
