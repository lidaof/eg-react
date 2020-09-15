import LabelConfig from "../trackContextMenu/LabelConfig";
import { TrackConfig } from "./TrackConfig";

import InteractionTrack, { DEFAULT_OPTIONS } from "../trackVis/interactionTrack/InteractionTrack";

import { HicSource } from "../../dataSources/HicSource";
import { TrackModel, TrackOptions } from "../../model/TrackModel";
import { BinSize, NormalizationMode } from "../..//model/HicDataModes";

import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import { InteractionDisplayModeConfig } from "../trackContextMenu/DisplayModeConfig";
import ScoreConfig from "../trackContextMenu/ScoreConfig";
import { BinSizeConfig, HicNormalizationConfig } from "../trackContextMenu/HicDataConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";
import LineWidthConfig from "../trackContextMenu/LineWidthConfig";
import { InteractionDisplayMode } from "../../model/DisplayModes";
import FetchViewWindowConfig from "components/trackContextMenu/FetchViewWindowConfig";
import MaxValueFilterConfig from "components/trackContextMenu/MaxValueFilterConfig";
import MinValueFilterConfig from "components/trackContextMenu/MinValueFilterConfig";
import BothAnchorsInViewConfig from "components/trackContextMenu/BothAnchorsInViewConfig";

export class HicTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions({
            ...DEFAULT_OPTIONS,
            binSize: BinSize.AUTO,
            normalization: NormalizationMode.NONE,
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
        return (
            oldOptions.normalization !== newOptions.normalization ||
            oldOptions.binSize !== newOptions.binSize ||
            oldOptions.fetchViewWindowOnly !== newOptions.fetchViewWindowOnly
        );
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        const items = [
            LabelConfig,
            HicNormalizationConfig,
            InteractionDisplayModeConfig,
            HeightConfig,
            ScoreConfig,
            BinSizeConfig,
            PrimaryColorConfig,
            SecondaryColorConfig,
            BackgroundColorConfig,
            MaxValueFilterConfig,
            MinValueFilterConfig,
            FetchViewWindowConfig,
            BothAnchorsInViewConfig,
        ];
        if (this.getOptions().displayMode !== InteractionDisplayMode.HEATMAP) {
            items.splice(2, 0, LineWidthConfig);
        }
        return items;
    }
}
