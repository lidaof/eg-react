import { TrackConfig } from './TrackConfig';

import InteractionTrack, { DEFAULT_OPTIONS } from '../trackVis/interactionTrack/InteractionTrack';

import { HicSource } from '../../dataSources/HicSource';
import { configStaticDataSource } from './configDataFetch';
import withCurrentGenome from '../withCurrentGenome';

import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { InteractionDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import { TrackModel } from '../../model/TrackModel';

const withDataFetch = configStaticDataSource((props: any) =>
    new HicSource(props.trackModel.url, props.genomeConfig.genome)
);
const HicTrack = withCurrentGenome(withDataFetch(InteractionTrack));

export class HicTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS)
    }

    getComponent() {
        return HicTrack;
    }

    getMenuComponents() {
        return [InteractionDisplayModeConfig, PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig];
    }
}
