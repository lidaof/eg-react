import { TrackConfig } from './TrackConfig';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { LongRangeWorker } from '../../dataSources/WorkerTSHook';

import InteractionTrack, { DEFAULT_OPTIONS } from '../trackVis/interactionTrack/InteractionTrack';

import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { InteractionDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';

export class LongRangeTrackConfig extends TrackConfig {
    constructor(props: any) {
        super(props);
        this.setDefaultOptions(DEFAULT_OPTIONS)
    }

    initDataSource() {
        return new WorkerSource(LongRangeWorker, this.trackModel.url);
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        return [InteractionDisplayModeConfig, PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig];
    }
}
