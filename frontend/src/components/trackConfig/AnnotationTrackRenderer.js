import TrackRenderer from './TrackRenderer';
import { AnnotationDisplayModes } from '../../model/DisplayModes';
import { DEFAULT_OPTIONS } from '../trackVis/commonComponents/annotation/AnnotationTrack';
import { AnnotationDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import MaxRowsConfig from '../trackContextMenu/MaxRowsConfig';

class AnnotationTrackRenderer extends TrackRenderer {
    constructor(trackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getMenuComponents() {
        let items = [...super.getMenuComponents(), AnnotationDisplayModeConfig];
        if (this.getOptions().displayMode === AnnotationDisplayModes.DENSITY) {
            items.push(HeightConfig);
        } else { // Assume FULL display mode
            items.push(MaxRowsConfig);
        }
        items.push(PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig);
        return items;
    }
}

export default AnnotationTrackRenderer;
