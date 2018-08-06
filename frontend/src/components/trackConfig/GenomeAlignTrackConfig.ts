import { TrackConfig } from './TrackConfig';

import { GenomeAlignTrack } from '../trackVis/GenomeAlignTrack';
import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import { TrackModel } from '../../model/TrackModel';

export class GenomeAlignTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
    }

    getComponent() {
        return GenomeAlignTrack;
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), HeightConfig, BackgroundColorConfig];
    }
}
