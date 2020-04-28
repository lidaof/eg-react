import { DynamicBedTrack, DEFAULT_OPTIONS } from "../trackVis/bedTrack/DynamicBedTrack";
import MatplotSource from "dataSources/MatplotSource";
import TrackModel from "../../model/TrackModel";
import { TrackConfig } from "./TrackConfig";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import {
    PrimaryColorConfig,
    SecondaryColorConfig,
    BackgroundColorConfig,
} from "components/trackContextMenu/ColorConfig";
import PlayingConfig from "components/trackContextMenu/PlayingConfig";
import SpeedConfig from "components/trackContextMenu/SpeedConfig";
import MaxRowsConfig from "components/trackContextMenu/MaxRowsConfig";
import HiddenPixelsConfig from "components/trackContextMenu/HiddenPixelsConfig";
import RowHeightConfig from "components/trackContextMenu/RowHeightConfig";

export class DynamicBedTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new MatplotSource(this.trackModel);
    }

    getComponent() {
        return DynamicBedTrack;
    }

    getMenuComponents() {
        return [
            LabelConfig,
            PlayingConfig,
            SpeedConfig,
            PrimaryColorConfig,
            SecondaryColorConfig,
            BackgroundColorConfig,
            RowHeightConfig,
            MaxRowsConfig,
            HiddenPixelsConfig,
        ];
    }
}
