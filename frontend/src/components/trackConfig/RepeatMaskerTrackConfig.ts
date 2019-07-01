import { TrackConfig } from './TrackConfig';
import RepeatSource from '../../dataSources/RepeatSource';

import RepeatMaskerTrack, { DEFAULT_OPTIONS } from '../trackVis/RepeatMaskerTrack';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { AnnotationDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';

import { RepeatDASFeature, RepeatMaskerFeature } from '../../model/RepeatMaskerFeature';
import { TrackModel } from '../../model/TrackModel';
import HiddenPixelsConfig from '../trackContextMenu/HiddenPixelsConfig';

export class RepeatMaskerTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new RepeatSource(this.trackModel.url);
    }

    formatData(data: RepeatDASFeature[]) {
        return data.map(feature => new RepeatMaskerFeature(feature))
    }

    getComponent() {
        return RepeatMaskerTrack;
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), AnnotationDisplayModeConfig, HeightConfig, 
            BackgroundColorConfig, HiddenPixelsConfig];
    }
}
