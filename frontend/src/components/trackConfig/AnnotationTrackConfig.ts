import { TrackConfig } from './TrackConfig';

import { DEFAULT_OPTIONS } from '../trackVis/commonComponents/annotation/AnnotationTrack';

import { AnnotationDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import MaxRowsConfig from '../trackContextMenu/MaxRowsConfig';

import { AnnotationDisplayModes } from '../../model/DisplayModes';
import { TrackModel } from '../../model/TrackModel';

export class AnnotationTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getMenuComponents() {
        const items = [...super.getMenuComponents(), AnnotationDisplayModeConfig];
        if (this.getOptions().displayMode === AnnotationDisplayModes.DENSITY) {
            items.push(HeightConfig);
        } else { // Assume FULL display mode
            items.push(MaxRowsConfig);
        }
        items.push(PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig);
        return items;
    }
}
