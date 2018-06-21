import _ from 'lodash';
import { Feature } from './Feature';
import DisplayedRegionModel from './DisplayedRegionModel';
import { FeaturePlacer } from './FeaturePlacer';

const VALUE_PROP_NAME = 'value';
/**
 * Available aggregators.  Note: SUM, MEAN, MIN, and MAX requires each record to have a `value` prop.
 */
const AggregatorTypes = {
    COUNT: 1, // Counts records
    SUM: 2, // Sums values of records
    MEAN: 3, // Computes averages of records
    MIN: 4, // Computes value of min record
    MAX: 5, // Computes value of max record
};

const aggregateFunctions = {};
aggregateFunctions[AggregatorTypes.COUNT] = (records: any[]) => records.length;
aggregateFunctions[AggregatorTypes.SUM] = (records: any[]) => _.sumBy(records, VALUE_PROP_NAME);
// For mean, min, and max; if passed an empty array, returns null
aggregateFunctions[AggregatorTypes.MEAN] = (
    (records: any[]) => records.length > 0 ? _.meanBy(records, VALUE_PROP_NAME) : null
);
aggregateFunctions[AggregatorTypes.MIN] = (records: any[]) => _.minBy(records, VALUE_PROP_NAME) || null;
aggregateFunctions[AggregatorTypes.MAX] = (records: any[]) => _.maxBy(records, VALUE_PROP_NAME) || null;

export const DefaultAggregators = {
    types: AggregatorTypes,
    fromId(id: number) {
        const aggregator = aggregateFunctions[id];
        if (!aggregator) {
            throw new Error(`Unknown aggregator id "${id}"`);
        }
        return aggregator;
    }
};

/**
 * Aggregator of features.  Includes methods to construct x-to-data maps.
 * 
 * @author Silas Hsu
 */
export class FeatureAggregator {
    /**
     * Constructs a mapping from x coordinate to all Features overlapping that location.  The mapping will be limited
     * to the range [0, width).
     * 
     * @param {Feature[]} features - features to use
     * @param {DisplayedRegionModel} viewRegion - used to compute drawing coordinates 
     * @param {number} width - width of the visualization
     * @return {Feature[][]} mapping from x coordinate to all Features overlapping that location
     */
    makeXMap(features: Feature[], viewRegion: DisplayedRegionModel, width: number): Feature[][] {
        width = Math.round(width); // Sometimes it's juuust a little bit off from being an int

        const xToFeatures = Array(width).fill(null);
        for (let x = 0; x < width; x++) { // Fill the array with empty arrays
            xToFeatures[x] = [];
        }

        const placer = new FeaturePlacer();
        const placement = placer.placeFeatures(features, viewRegion, width);
        for (const placedFeature of placement) {
            const startX = Math.floor(placedFeature.xLocation.start);
            const endX = Math.ceil(placedFeature.xLocation.end);
            for (let x = startX; x <= endX; x++) {
                xToFeatures[x].push(placedFeature.feature);
            }
        }
        return xToFeatures;
    }
}
