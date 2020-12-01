import MatplotSource from "../../dataSources/MatplotSource";
import DynamicplotTrack, { DEFAULT_OPTIONS } from "../trackVis/commonComponents/numerical/DynamicplotTrack";
import { TrackConfig } from "./TrackConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";
import YscaleConfig from "../trackContextMenu/YscaleConfig";
import AggregateConfig from "../trackContextMenu/AggregateConfig";
import SmoothConfig from "../trackContextMenu/SmoothConfig";
import { BackgroundColorConfig, PrimaryColorConfig } from "../trackContextMenu/ColorConfig";
import TrackModel from "../../model/TrackModel";
import SpeedConfig from "components/trackContextMenu/SpeedConfig";
import PlayingConfig from "components/trackContextMenu/PlayingConfig";
import UseDynamicColorsConfig from "components/trackContextMenu/UseDynamicColorsConfig";

export class DynamicplotTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        let options = { ...DEFAULT_OPTIONS };
        if (!this.trackModel.options.dynamicLabels) {
            const labels = this.trackModel.tracks.map((t) => t.label);
            options = { ...options, dynamicLabels: labels };
        }
        this.setDefaultOptions(options);
    }

    initDataSource() {
        return new MatplotSource(this.trackModel);
    }

    getComponent() {
        return DynamicplotTrack;
    }

    getMenuComponents() {
        return [
            ...super.getMenuComponents(),
            HeightConfig,
            PlayingConfig,
            SpeedConfig,
            YscaleConfig,
            AggregateConfig,
            SmoothConfig,
            PrimaryColorConfig,
            UseDynamicColorsConfig,
            BackgroundColorConfig,
        ];
    }
}
