/**
 * Records returned by BedSource and its worker.  Each prop is a column in the bed file.
 * 
 * @author Silas Hsu
 */
interface BedRecord {
    chr: string;
    start: number;
    end: number;

    /**
     * Free text of the 4th column of the bed file, where columns are indexed from 1
     */
    details: string;
}

export default BedRecord;
