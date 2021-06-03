import { TrackConfig } from "./TrackConfig";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import HeightConfig from "components/trackContextMenu/HeightConfig";
import YscaleConfig from "components/trackContextMenu/YscaleConfig";
import { TrackModel, TrackOptions } from "../../model/TrackModel";
import { BigWigTrackConfig } from "./BigWigTrackConfig";
import DynseqTrack, { DEFAULT_OPTIONS, MAX_PIXELS_PER_BASE_NUMERIC } from "../trackVis/dynseq/DynseqTrack";
import { BackgroundColorConfig } from "components/trackContextMenu/ColorConfig";

export class DynseqTrackConfig extends TrackConfig {
    private bigWigTrackConfig: BigWigTrackConfig;
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.bigWigTrackConfig = new BigWigTrackConfig(trackModel);
        this.setDefaultOptions({ ...DEFAULT_OPTIONS, zoomLevel: "auto" });
    }

    initDataSource() {
        return this.bigWigTrackConfig.initDataSource();
    }

    formatData(data: any[]) {
        return this.bigWigTrackConfig.formatData(data);
    }

    shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
        return this.bigWigTrackConfig.shouldFetchBecauseOptionChange(oldOptions, newOptions);
    }

    getComponent() {
        return DynseqTrack;
    }

    getMenuComponents(basesPerPixel: number) {
        if (basesPerPixel <= MAX_PIXELS_PER_BASE_NUMERIC) {
            return [LabelConfig, HeightConfig, YscaleConfig, BackgroundColorConfig];
        } else {
            return this.bigWigTrackConfig.getMenuComponents();
        }
    }
}
