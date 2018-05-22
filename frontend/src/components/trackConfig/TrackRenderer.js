import UnknownTrack from '../trackVis/UnknownTrack';
import LabelConfig from '../trackContextMenu/LabelConfig';

class TrackRenderer {
    constructor(trackModel) {
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
    setDefaultOptions(defaults) {
        return Object.assign(this.defaultOptions, defaults);
    }

    getOptions() {
        return Object.assign({}, this.defaultOptions, this.trackModel.options);
    }

    getComponent() {
        return UnknownTrack;
    }

    getMenuComponents() {
        return [LabelConfig];
    }
}

export default TrackRenderer;
