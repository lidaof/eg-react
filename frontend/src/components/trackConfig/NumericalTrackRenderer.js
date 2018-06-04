import TrackRenderer from './TrackRenderer';
import { DEFAULT_OPTIONS } from '../trackVis/commonComponents/numerical/NumericalTrack';
import { NumericalDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import { PrimaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';

class NumericalTrackRenderer extends TrackRenderer {
    constructor(trackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), NumericalDisplayModeConfig, HeightConfig, PrimaryColorConfig,
            BackgroundColorConfig];
    }
}

export default NumericalTrackRenderer;
