import LabelConfig from "components/trackContextMenu/LabelConfig";
import HeightConfig from "components/trackContextMenu/HeightConfig";
import YscaleConfig from "components/trackContextMenu/YscaleConfig";
import { TrackModel } from "../../model/TrackModel";
import { BigWigTrackConfig } from "./BigWigTrackConfig";
import DynseqTrack, { DEFAULT_OPTIONS } from "../trackVis/dynseq/DynseqTrack";
import {
    BackgroundColorConfig,
    PrimaryColorConfig,
    SecondaryColorConfig,
} from "components/trackContextMenu/ColorConfig";

export class DynseqTrackConfig extends BigWigTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getComponent() {
        return DynseqTrack;
    }

    getMenuComponents() {
        return [
            LabelConfig,
            HeightConfig,
            YscaleConfig,
            PrimaryColorConfig,
            SecondaryColorConfig,
            BackgroundColorConfig,
        ];
    }
}
