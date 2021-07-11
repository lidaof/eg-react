import { TrackConfig } from "./TrackConfig";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import HeightConfig from "components/trackContextMenu/HeightConfig";
import { TrackModel, TrackOptions } from "../../model/TrackModel";
import { BigWigTrackConfig } from "./BigWigTrackConfig";
import { BedGraphTrackConfig } from "./BedGraphTrackConfig";
import BoxplotTrack, { DEFAULT_OPTIONS } from "../trackVis/commonComponents/stats/BoxplotTrack";
import { BackgroundColorConfig, BoxColorConfig, LineColorConfig } from "components/trackContextMenu/ColorConfig";
import WindowSizeConfig from "components/trackContextMenu/WindowSizeConfig";

export class BoxplotTrackConfig extends TrackConfig {
    private trackConfig: TrackConfig;
    constructor(trackModel: TrackModel) {
        super(trackModel);
        let options;
        if (trackModel.url.endsWith(".gz")) {
            this.trackConfig = new BedGraphTrackConfig(trackModel);
            options = { ...DEFAULT_OPTIONS }
        } else {
            this.trackConfig = new BigWigTrackConfig(trackModel);
            options = { ...DEFAULT_OPTIONS, zoomLevel: "auto" };
        }
        this.setDefaultOptions(options)
    }

    initDataSource() {
        return this.trackConfig.initDataSource();
    }

    formatData(data: any[]) {
        return this.trackConfig.formatData(data);
    }

    shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
        return this.trackConfig.shouldFetchBecauseOptionChange(oldOptions, newOptions);
    }

    getComponent() {
        return BoxplotTrack;
    }

    getMenuComponents(basesPerPixel: number) {
        return [LabelConfig, WindowSizeConfig, HeightConfig, BoxColorConfig, LineColorConfig, BackgroundColorConfig];
    }
}
