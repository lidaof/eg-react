import { NumericalFeature } from "./Feature";
import TrackModel from "./TrackModel";

/**
 * @typeparam T - the type of data required from tracks in order for this to function.
 */
export interface TrackGroupOptionBuilder<T> {
    /**
     * @param group tracks in one group
     * @param datas data for the tracks
     * @return options object common to the entire group
     */
    getCommonOptionsForGroup(group: TrackModel[], datas: T[][]): {};
}

class NumericalTrackGroupOptionBuilder implements TrackGroupOptionBuilder<NumericalFeature> {
    getCommonOptionsForGroup(group: TrackModel[], datas: NumericalFeature[][]) {
        // maybe import stuff from FeatureAggregator?
        return { min: 0, max: 10 };
    }
}
