/**
 * Records returned by BedSource and its worker.  Each prop is a column in the bed file.
 */
interface BedRecord {
    chr: string;
    start: number;
    end: number;
    details: string; // Free text
}
