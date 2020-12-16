import { TrackConfig } from "./TrackConfig";

import { GenomeAlignTrack, DEFAULT_OPTIONS } from "../trackVis/GenomeAlignTrack";
import {
    BackgroundColorConfig,
    primaryGenomeColorConfig,
    queryGenomeColorConfig,
} from "../trackContextMenu/ColorConfig";
import HeightConfig from "../trackContextMenu/HeightConfig";
import { TrackModel } from "../../model/TrackModel";

export class GenomeAlignTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getComponent() {
        return GenomeAlignTrack;
    }

    getMenuComponents() {
        return [
            ...super.getMenuComponents(),
            HeightConfig,
            primaryGenomeColorConfig,
            queryGenomeColorConfig,
            BackgroundColorConfig,
        ];
    }
}
