import UnknownTrack from '../trackVis/UnknownTrack';
import LabelConfig from '../trackContextMenu/LabelConfig';
import { TrackModel, TrackOptions } from '../../model/TrackModel';
import DataSource from '../../dataSources/DataSource';

export class TrackConfig {
    public defaultOptions: TrackOptions;

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

    initDataSource(): DataSource {
        return new DataSource();
    }

    formatData(data: any): any {
        return data;
    }

    getOptions(): TrackOptions {
        return Object.assign({}, this.defaultOptions, this.trackModel.options);
    }

    /**
     * Gets whether a change in options should cause a data fetch.
     *
     * @param {TrackOptions} oldOptions - previous options of the track
     * @param {TrackOptions} oldOptions - new options
     * @return {boolean} whether a data fetch is suggested due to a change in options
     */
    shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
        return false;
    }

    isGenomeAlignTrack(): boolean {
        return this.trackModel.type === "genomealign" || this.trackModel.filetype === "genomealign";
    }

    /**
     *
     * @param oldRegion
     * @param newRegion
     * @return {boolean} whether to fetch new data due to region change
     */
    shouldFetchBecauseRegionChange(currentOptions: TrackOptions): boolean {
        return true;
    }

    getComponent(): React.ComponentType {
        return UnknownTrack;
    }

    getMenuComponents(): React.ComponentType[] {
        return [LabelConfig];
    }
}
