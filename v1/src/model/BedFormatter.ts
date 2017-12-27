import BedRecord from './BedRecord';
import DisplayedRegionModel from './DisplayedRegionModel';
import Feature from './Feature';

/**
 * Turns BedRecords into something else.
 * 
 * @author Silas Hsu
 */
interface BedFormatter {
    format(records: BedRecord[], region: DisplayedRegionModel, segment: Feature): Object[]
}

export default BedFormatter;
