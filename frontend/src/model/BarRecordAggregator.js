import _ from 'lodash';
import BarRecord from './BarRecord';
import OpenInterval from './interval/OpenInterval';

/**
 * Aggregation to run at each x location.  The result may or may not contain a reference to the original data.
 */
const AggregatorTypes = {
    /**
     * Do no aggregation.
     */
    NONE: 0,
    /**
     * Counts records that overlap each location
     */
    COUNT: 1,
    /**
     * Sum the values of records that overlap each location
     */
    SUM: 2,
    /**
     * Computes average of records that overlap each location
     */
    MEAN: 3,
    /**
     * Computes min value of records that overlap each location.  This record will be stored in the `originalData` prop
     * of the aggregated record.
     */
    MIN: 4,
    /**
     * Computes max of records that overlap each location.  This record will be stored in the `originalData` prop
     * of the aggregated record.
     */
    MAX: 5
};

const aggregateFunctions = {};
const VALUE_PROP_NAME = 'value';
aggregateFunctions[AggregatorTypes.NONE] = _.identity;
aggregateFunctions[AggregatorTypes.COUNT] = (recordArray, xLocation) =>
    [ new BarRecord(xLocation, recordArray.length) ];
aggregateFunctions[AggregatorTypes.SUM] = (recordArray, xLocation) =>
    [ new BarRecord(xLocation, _.sumBy(recordArray, VALUE_PROP_NAME)) ];
aggregateFunctions[AggregatorTypes.MEAN] = (recordArray, xLocation) => {
    if (recordArray.length === 0) {
        return recordArray;
    } else {
        return [ new BarRecord(xLocation, _.meanBy(recordArray, VALUE_PROP_NAME)) ]
    }
};
aggregateFunctions[AggregatorTypes.MIN] = (recordArray, xLocation) => {
    if (recordArray.length === 0) {
        return recordArray;
    } else {
        return [ new BarRecord(xLocation, _.minBy(recordArray, VALUE_PROP_NAME)) ]
    }
};
aggregateFunctions[AggregatorTypes.MAX] = (recordArray, xLocation) => {
    if (recordArray.length === 0) {
        return recordArray;
    } else {
        return [ new BarRecord(xLocation, _.maxBy(recordArray, VALUE_PROP_NAME)) ]
    }
};

/**
 * Various aggregators of BarRecords.  Includes methods to construct x-to-data maps, getting the max and min of a set of
 * records, etc.
 * 
 * @author Silas Hsu
 */
class BarRecordAggregator {
    static AggregatorTypes = AggregatorTypes;

    /**
     * Constructs a mapping from x coordinate to all BarRecords overlapping that location.  The mapping will be limited
     * to the range [0, width).
     * 
     * @param {BarRecord[]} records - records to use
     * @param {number} width - maximum x coordinate to allow
     * @return {BarRecord[][]} mapping from x coordinate to all BarRecords overlapping that location
     */
    makeXMap(records, width) {
        let xToRecordsMap = new Array(Math.round(width));
        for (let x = 0; x < width; x++) { // Fill the array with empty arrays
            xToRecordsMap[x] = [];
        }

        for (let record of records) {
            const xStart = Math.max(0, record.xLocation.start);
            const xEnd = Math.min(width, record.xLocation.end);
            for (let x = xStart; x < xEnd; x++) {
                xToRecordsMap[x].push(record);
            }
        }
        return xToRecordsMap;
    }

    /**
     * Constructs a mapping from x coordinate to *an aggregation* of all BarRecords overlapping that location.  The
     * mapping will be limited to the range [0, width).  For example, the aggregation could be the mean value.
     * 
     * @param {BarRecord[]} records - records to use
     * @param {number} width - maximum x coordinate to allow
     * @param {number} [aggregatorType] - aggregation method.  See static property AggregatorTypes.
     * @return {BarRecord[][]} mapping from x coordinate to aggregated BarRecords at that location
     */
    aggregateByX(records, width, aggregatorType=AggregatorTypes.NONE) {
        const xToRecordsMap = this.makeXMap(records, width);
        if (aggregatorType === AggregatorTypes.NONE) {
            return xToRecordsMap;
        }
        const aggregator = aggregateFunctions[aggregatorType];
        if (!aggregator) {
            console.error(`Unknown aggregator type: ${aggregatorType}.  Defaulting to NONE.`);
            return xToRecordsMap;
        }

        return xToRecordsMap.map((recordArray, x) => {
            const xLocation = new OpenInterval(x, x + 1);
            const result = aggregator(recordArray, xLocation);
            return result;
        });
    }

    /**
     * Gets the min and max values of a 2D array of BarRecord, such as those returned by aggregateByX().  If there are
     * no records in the array at all, returns a min and max of both 0.
     * 
     * @param {BarRecord[][]} xMap - data for which to find min and max
     * @return {Object} object with props min and max
     */
    getMinMax(xMap) {
        const flattened = _.flatten(xMap);
        if (flattened.length === 0) {
            return {
                min: 0,
                max: 0,
            };
        }
        const minRecord = _.minBy(flattened, VALUE_PROP_NAME);
        const maxRecord = _.maxBy(flattened, VALUE_PROP_NAME);
        return {
            min: minRecord[VALUE_PROP_NAME],
            max: maxRecord[VALUE_PROP_NAME]
        };
    }
}

export default BarRecordAggregator;
