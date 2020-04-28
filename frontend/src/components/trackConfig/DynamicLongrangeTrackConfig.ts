import LabelConfig from "../trackContextMenu/LabelConfig";
import { TrackConfig } from "./TrackConfig";
import DynamicInteractionTrack, { DEFAULT_OPTIONS } from "../trackVis/interactionTrack/DynamicInteractionTrack";
import { TrackModel } from "../../model/TrackModel";
import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import ScoreConfig from "../trackContextMenu/ScoreConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";
import MatplotSource from "../../dataSources/MatplotSource";
import SpeedConfig from "components/trackContextMenu/SpeedConfig";
import { DynamicInteractionDisplayModeConfig } from "components/trackContextMenu/DisplayModeConfig";
import LineWidthConfig from "components/trackContextMenu/LineWidthConfig";
import { DynamicInteractionDisplayMode } from "model/DisplayModes";
import PlayingConfig from "components/trackContextMenu/PlayingConfig";

export class DynamicLongrangeTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new MatplotSource(this.trackModel);
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
            HeightConfig,
            ScoreConfig,
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
