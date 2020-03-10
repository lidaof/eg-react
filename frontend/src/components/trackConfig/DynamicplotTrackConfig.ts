import MatplotSource from "../../dataSources/MatplotSource";
import DynamicplotTrack, { DEFAULT_OPTIONS } from "../trackVis/commonComponents/numerical/DynamicplotTrack";
import { TrackConfig } from "./TrackConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";
import YscaleConfig from "../trackContextMenu/YscaleConfig";
import AggregateConfig from "../trackContextMenu/AggregateConfig";
import SmoothConfig from "../trackContextMenu/SmoothConfig";
import { BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import LineWidthConfig from "../trackContextMenu/LineWidthConfig";
import TrackModel from "../../model/TrackModel";

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
            YscaleConfig,
            AggregateConfig,
            LineWidthConfig,
            SmoothConfig,
            BackgroundColorConfig
        ];
    }
}
