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

export class DynamicplotTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
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
            SpeedConfig,
            YscaleConfig,
            AggregateConfig,
            SmoothConfig,
            PrimaryColorConfig,
            BackgroundColorConfig
        ];
    }
}
