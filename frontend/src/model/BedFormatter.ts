import BedRecord from './BedRecord';
import DisplayedRegionModel from './DisplayedRegionModel';
import Feature from './Feature';

/**
 * Turns BedRecords into something else.
 * 
 * @author Silas Hsu
 */
interface BedFormatter {
    /**
     * Turns a set of BedRecord into something else.  The second and third parameters exist to assist mapping to a
     * navigation context.
     * 
     * @param {BedRecord[]} bedRecords - the records to convert
     * @param {DisplayedRegionModel} region - object containing navigation context and view region
     * @param {FeatureInterval} feature - target feature in navigation context to map to
     * @override
     */
    format(records: BedRecord[], region: DisplayedRegionModel, feature: Feature): Object[]
}

export default BedFormatter;
