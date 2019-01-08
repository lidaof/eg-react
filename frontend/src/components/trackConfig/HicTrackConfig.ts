import { TrackConfig } from './TrackConfig';

import InteractionTrack, { DEFAULT_OPTIONS } from '../trackVis/interactionTrack/InteractionTrack';

import { HicSource } from '../../dataSources/HicSource';
import { TrackModel } from '../../model/TrackModel';

import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { InteractionDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import ScoreConfig from '../trackContextMenu/ScoreConfig';
import { BinSizeConfig } from '../trackContextMenu/BinSizeConfig';

export class HicTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS)
    }

    initDataSource() {
        if(this.trackModel.fileObj) {
            return new HicSource(this.trackModel.fileObj);
        } else {
            return new HicSource(this.trackModel.url);
        }
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        return [InteractionDisplayModeConfig, ScoreConfig, BinSizeConfig,
            PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig];
    }
}
