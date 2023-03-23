/**
 * Records returned by BedSource and its worker.  Each prop is a column in the bed file.
 *
 * @author Silas Hsu
 */
interface BedRecord {
    chr: string;
    start: number;
    end: number;
    [column: number]: string; // The rest of the columns in the bed file, starting from [3]
    n?: number; // number of columns in initial data row
}

export default BedRecord;
