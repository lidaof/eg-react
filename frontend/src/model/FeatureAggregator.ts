import _ from "lodash";
import { Feature } from "./Feature";
import DisplayedRegionModel from "./DisplayedRegionModel";
import { FeaturePlacer } from "./FeaturePlacer";

const VALUE_PROP_NAME = "value";

/**
 * Available aggregators.  Note: SUM, MEAN, MIN, and MAX requires each record to have a `value` prop.
 */
export const AggregatorTypes = {
    MEAN: "MEAN", // Computes averages of records
    SUM: "SUM", // Sums values of records
    COUNT: "COUNT", // Counts records
    MIN: "MIN", // Computes value of min record
    MAX: "MAX", // Computes value of max record
    IMAGECOUNT: "IMAGECOUNT", // for image track count
};

const aggregateFunctions = {};
aggregateFunctions[AggregatorTypes.COUNT] = (records: any[]) => records.length;
aggregateFunctions[AggregatorTypes.SUM] = (records: any[]) =>
    records.length > 0 ? _.sumBy(records, VALUE_PROP_NAME) : null;
// For mean, min, and max; if passed an empty array, returns null
aggregateFunctions[AggregatorTypes.MEAN] = (records: any[]) =>
    records.length > 0 ? _.meanBy(records, VALUE_PROP_NAME) : null;
aggregateFunctions[AggregatorTypes.MIN] = (records: any[]) =>
    records.length > 0 ? _.minBy(records, VALUE_PROP_NAME)[VALUE_PROP_NAME] : null;
aggregateFunctions[AggregatorTypes.MAX] = (records: any[]) =>
    records.length > 0 ? _.maxBy(records, VALUE_PROP_NAME)[VALUE_PROP_NAME] : null;

aggregateFunctions[AggregatorTypes.IMAGECOUNT] = (records: any[]) => _.sum(records.map((x) => x.images.length));

/**
 * aggregator utils for array data
 */
const VALUES_PROP_NAME = "values";

export const ArrayAggregatorTypes = {
    MEAN: "MEAN", //computers average of each element in the array from multiple arrays
};

const arrayAggregateFunctions = {};
arrayAggregateFunctions[ArrayAggregatorTypes.MEAN] = (records: any[]) =>
    calMeanOfArrays(records, VALUES_PROP_NAME) || [null];
/**
 * calculate mean value of each array elements and save to a new array
 * [
 *  [1,2,3],
 *  [4,5,6]
 * ]
 * to
 * [2.5, 3.5, 4.5]
 * missing number is any position is filled with 0 in original array
 *
 * @param records array of value objest, data stored in values property
 * @param dataKeyName default to `values`
 */
export function calMeanOfArrays(records: any[], dataKeyName: string) {
    const valuesArray = records.map((record) => record[dataKeyName]);
    const maxLen = _.max(valuesArray.map((v) => v.length));
    let i, j, tmp;
    const results = Array(maxLen).fill(null);
    for (i = 0; i < maxLen; i++) {
        tmp = [];
        for (j = 0; j < valuesArray.length; j++) {
            if (i < valuesArray[j].length) {
                tmp.push(valuesArray[j][i]);
            } else {
                tmp.push(0);
            }
        }
        results[i] = tmp.slice();
    }
    return results.map((v) => _.mean(v));
}

export const DefaultAggregators = {
    types: AggregatorTypes,
    fromId(id: string) {
        const aggregator = aggregateFunctions[id];
        if (!aggregator) {
            throw new Error(`Unknown aggregator id "${id}"`);
        }
        return aggregator;
    },
};

export const DefaultArrayAggregators = {
    types: ArrayAggregatorTypes,
    fromId(id: string) {
        const aggregator = arrayAggregateFunctions[id];
        if (!aggregator) {
            throw new Error(`Unknown aggregator id "${id}"`);
        }
        return aggregator;
    },
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
    makeXMap(
        features: Feature[],
        viewRegion: DisplayedRegionModel,
        width: number,
        useCenter: boolean = false
    ): Feature[][] {
        width = Math.round(width); // Sometimes it's juuust a little bit off from being an int

        const xToFeatures = Array(width).fill(null);
        for (let x = 0; x < width; x++) {
            // Fill the array with empty arrays
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

    makeXWindowMap(
        features: Feature[],
        viewRegion: DisplayedRegionModel,
        width: number,
        useCenter: boolean = false,
        windowSize: number
    ): { [x: number]: Feature[] } {
        const map = {};
        width = Math.round(width); // Sometimes it's juuust a little bit off from being an int
        for (let x = 0; x < width; x += windowSize) {
            // Fill the array with empty arrays
            // if (x < width) {
            map[x] = [];
            // }
        }
        const placer = new FeaturePlacer();
        const placement = placer.placeFeatures(features, viewRegion, width, useCenter);
        for (const placedFeature of placement) {
            const startX = Math.max(0, Math.floor(placedFeature.xSpan.start));
            const endX = Math.min(width - 1, Math.ceil(placedFeature.xSpan.end));
            for (let x = startX; x <= endX; x++) {
                if (map.hasOwnProperty(x)) {
                    map[x].push(placedFeature.feature);
                }
            }
        }
        return map;
    }
}
