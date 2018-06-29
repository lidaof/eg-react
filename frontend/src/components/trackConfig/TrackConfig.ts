import UnknownTrack from '../trackVis/UnknownTrack';
import LabelConfig from '../trackContextMenu/LabelConfig';
import { TrackModel, TrackOptions } from '../../model/TrackModel';

export class TrackConfig {
    public defaultOptions: TrackOptions

    constructor(public trackModel: TrackModel) {
        this.trackModel = trackModel;
        this.defaultOptions = {};
    }

    /**
     * Merge an object into this instance's default options, which are used in `getOptions()`.  If keys already exist in
     * the default options, this method overrides them.
     * 
     * @param {Object} defaults - object that will be merged into this track's default options
     * @return {Object} - new default options
     */
    setDefaultOptions(defaults: TrackOptions): TrackOptions {
        return Object.assign(this.defaultOptions, defaults);
    }

    getOptions(): TrackOptions {
        return Object.assign({}, this.defaultOptions, this.trackModel.options);
    }

    getComponent(): React.ComponentType {
        return UnknownTrack;
    }

    getMenuComponents(): React.ComponentType[] {
        return [LabelConfig];
    }
}
