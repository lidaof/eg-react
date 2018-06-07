import _ from 'lodash';
import LinearDrawingModel from './LinearDrawingModel';

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
    METHYLC: 6,
};

const aggregateFunctions = {};
aggregateFunctions[AggregatorTypes.COUNT] = records => records.length;
aggregateFunctions[AggregatorTypes.SUM] = records => _.sumBy(records, VALUE_PROP_NAME);
// For mean, min, and max; if passed an empty array, returns null
aggregateFunctions[AggregatorTypes.MEAN] = records => records.length > 0 ? _.meanBy(records, VALUE_PROP_NAME) : null;
aggregateFunctions[AggregatorTypes.MIN] = records => _.minBy(records, VALUE_PROP_NAME) || null;
aggregateFunctions[AggregatorTypes.MAX] = records => _.maxBy(records, VALUE_PROP_NAME) || null;

export const DefaultAggregators = {
    types: AggregatorTypes,
    fromId: function(id) {
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
class FeatureAggregator {
    /**
     * Constructs a mapping from x coordinate to all Features overlapping that location.  The mapping will be limited
     * to the range [0, width).
     * 
     * @param {Feature[]} features - features to use
     * @param {number} width - maximum x coordinate to allow
     * @return {Feature[][]} mapping from x coordinate to all Features overlapping that location
     */
    makeXMap(features, viewRegion, width) {
        width = Math.round(width); // Sometimes it's juuust a little bit off from being an int

        let xToFeatures = Array(width).fill(null);
        for (let x = 0; x < width; x++) { // Fill the array with empty arrays
            xToFeatures[x] = [];
        }

        const drawModel = new LinearDrawingModel(viewRegion, width);
        const navContext = viewRegion.getNavigationContext();
        for (let feature of features) {
            const absLocations = navContext.convertGenomeIntervalToBases(feature.locus);
            for (let location of absLocations) {
                let startX = Math.floor(drawModel.baseToX(location.start));
                startX = Math.max(0, startX);
                let endX = Math.ceil(drawModel.baseToX(location.end));
                endX = Math.min(endX, width - 1);
                for (let x = startX; x <= endX; x++) {
                    xToFeatures[x].push(feature);
                }
            }
        }

        return xToFeatures;
    }
}

export default FeatureAggregator;
