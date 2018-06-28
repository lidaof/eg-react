import TrackRenderer from './TrackRenderer';
import InteractionTrack, { DEFAULT_OPTIONS } from '../trackVis/interactionTrack/InteractionTrack';

import { HicSource } from '../../dataSources/HicSource';
import { configStaticDataSource } from './configDataFetch';
import withCurrentGenome from '../withCurrentGenome';

import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { InteractionDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';

const withDataFetch = configStaticDataSource(props =>
    new HicSource(props.trackModel.url, props.genomeConfig.genome)
);
const HicTrack = withCurrentGenome(withDataFetch(InteractionTrack));

class HicTrackRenderer extends TrackRenderer {
    constructor(trackModel) {
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

export default HicTrackRenderer;
