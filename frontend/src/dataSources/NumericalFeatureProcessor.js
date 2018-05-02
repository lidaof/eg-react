import PropTypes from 'prop-types';
import DataProcessor from './DataProcessor';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import { BarRecord, NumericalFeature } from '../model/BarRecord';
import BarRecordAggregator from '../model/BarRecordAggregator';

const INPUT_PROP_TYPES = {
    data: PropTypes.arrayOf(NumericalFeature.propType), // Data to process
    /**
     * View region, used to map data to nav context coordinates
     */
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    width: PropTypes.number.isRequired,
    options: PropTypes.shape({
        aggregateMethod: PropTypes.oneOf(Object.values(BarRecordAggregator.AggregatorTypes))
    }).isRequired,
};

/**
 * A data processor that aggregates NumericalFeatures into BarRecords.  For expected inputs, see the `INPUT_PROP_TPYES`
 * object above this doc.  Outputs objects with the following props:
 *  - `xToRecords` - a mapping from x coordinate to all BarRecords that overlap that location
 *  - `min` - minimum value of all records
 *  - `max` - maximum value of all the records
 * 
 * @author Silas Hsu
 */
class NumericalFeatureProcessor extends DataProcessor {
    getInputPropTypes() {
        return INPUT_PROP_TYPES;
    }

    shouldProcess(prevProps, nextProps) {
        return prevProps.data !== nextProps.data ||
            prevProps.viewRegion !== nextProps.viewRegion ||
            prevProps.width !== nextProps.width ||
            prevProps.options.aggregator !== nextProps.options.aggregator;
    }

    /**
     * Processes data in the way described by the class docstring.
     * 
     * @param {Object} props - object containing data to process
     * @return {Object} aggregated BarRecords
     */
    process(props) {
        if (!props.data) {
            return {
                xToRecords: [],
                min: 0,
                max: 0
            };
        }
        const barRecords = BarRecord.fromNumericalFeatures(props.data, props.viewRegion, props.width);
        const aggregator = new BarRecordAggregator();
        const xToRecords = aggregator.aggregateByX(barRecords, props.width, props.options.aggregateMethod);
        return {
            xToRecords: xToRecords,
            ...aggregator.getMinMax(xToRecords)
        };
    }
}

export default NumericalFeatureProcessor;
