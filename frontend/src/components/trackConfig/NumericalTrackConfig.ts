import { TrackConfig } from './TrackConfig';
import { DEFAULT_OPTIONS } from '../trackVis/commonComponents/numerical/NumericalTrack';
import { NumericalDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import { PrimaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import { TrackModel } from '../../model/TrackModel';

export class NumericalTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), NumericalDisplayModeConfig, HeightConfig, PrimaryColorConfig,
            BackgroundColorConfig];
    }
}
