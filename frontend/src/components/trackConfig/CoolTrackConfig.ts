import { InteractionDisplayMode } from './../../model/DisplayModes';
import { TrackConfig } from './TrackConfig';
import InteractionTrack, { DEFAULT_OPTIONS } from '../trackVis/interactionTrack/InteractionTrack';
import { CoolSource } from '../../dataSources/CoolSource';
import { InteractionDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import ScoreConfig from '../trackContextMenu/ScoreConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import LineWidthConfig from '../trackContextMenu/LineWidthConfig';

export class CoolTrackConfig extends TrackConfig {
    constructor(props: any) {
        super(props);
        this.setDefaultOptions(DEFAULT_OPTIONS)
    }

    initDataSource() {
        return new CoolSource(this.trackModel.url);
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        const items =  [InteractionDisplayModeConfig, HeightConfig, ScoreConfig,
            PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig];
        if (this.getOptions().displayMode === InteractionDisplayMode.ARC) {
            items.splice(1, 0, LineWidthConfig);
        }
        return items;
    }
}
