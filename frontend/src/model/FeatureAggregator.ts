import _ from 'lodash';
import { Feature } from './Feature';
import DisplayedRegionModel from './DisplayedRegionModel';
import { FeaturePlacer } from './FeaturePlacer';

const VALUE_PROP_NAME = 'value';
const VALUES_PROP_NAME = 'values';
/**
 * Available aggregators.  Note: SUM, MEAN, MIN, and MAX requires each record to have a `value` prop.
 */
export const AggregatorTypes = {
    MEAN: "MEAN", // Computes averages of records
    SUM: "SUM", // Sums values of records
    COUNT: "COUNT", // Counts records
    MIN: "MIN", // Computes value of min record
    MAX: "MAX", // Computes value of max record
    MEAN_ARRAY: "MEAN_ARRAY", //computers average of each element in the array from multiple arrays
};

const aggregateFunctions = {};
aggregateFunctions[AggregatorTypes.COUNT] = (records: any[]) => records.length;
aggregateFunctions[AggregatorTypes.SUM] = (records: any[]) => _.sumBy(records, VALUE_PROP_NAME);
// For mean, min, and max; if passed an empty array, returns null
aggregateFunctions[AggregatorTypes.MEAN] = (
    (records: any[]) => records.length > 0 ? _.meanBy(records, VALUE_PROP_NAME) : null
);
aggregateFunctions[AggregatorTypes.MIN] = (records: any[]) => 
    _.minBy(records, VALUE_PROP_NAME)[VALUE_PROP_NAME] || null;
aggregateFunctions[AggregatorTypes.MAX] = (records: any[]) => 
    _.maxBy(records, VALUE_PROP_NAME)[VALUE_PROP_NAME] || null;

aggregateFunctions[AggregatorTypes.MEAN_ARRAY] = ( (records: any[]) => {
    const valuesArray = records.map(record => record[VALUES_PROP_NAME]);
    const maxLen = _.max(valuesArray.map(v => v.length));
    const results = Array(valuesArray.length).fill(null);
    let i = 0, j = 0;
    for (; i< valuesArray.length; i++){
        let tmp = []
        for(; j< maxLen; j++) {
            if(j <= valuesArray[i].length)
            tmp.push(valuesArray[j][i])
        }
        results[i] = tmp.slice();
    }
    return results.map(v => _.mean(v));
});

export const DefaultAggregators = {
    types: AggregatorTypes,
    fromId(id: string) {
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
    makeXMap(features: Feature[], viewRegion: DisplayedRegionModel, width: number, useCenter: boolean=false): Feature[][] {
        width = Math.round(width); // Sometimes it's juuust a little bit off from being an int

        const xToFeatures = Array(width).fill(null);
        for (let x = 0; x < width; x++) { // Fill the array with empty arrays
            xToFeatures[x] = [];
        }

        const placer = new FeaturePlacer();
        const placement = placer.placeFeatures(features, viewRegion, width, useCenter);
        for (const placedFeature of placement) {
            const startX = Math.max(0, Math.floor(placedFeature.xSpan.start));
            const endX = Math.min(width - 1, Math.ceil(placedFeature.xSpan.end));
            for (let x = startX; x <= endX; x++) {
                xToFeatures[x].push(placedFeature.feature);
            }
        }
        return xToFeatures;
    }
}
