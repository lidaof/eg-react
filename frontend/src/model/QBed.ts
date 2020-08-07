import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import BedRecord from '../dataSources/bed/BedRecord';

enum QBedColumnIndex {
    VALUE=3,
    STRAND=4,
    ANNOTATION=5
};


/**
 * A data container for a qBED object.
 * 
 * @author Daofeng Li and Arnav Moudgil
 */
class QBed extends Feature {
    /*
    Input， strings like following
    chr1    51441754        51441758        1       -       CTAGAGACTGGC
    chr1    51441754        51441758        21      -       CTTTCCTCCCCA
    chr1    51982564        51982568        3       +       CGCGATCGCGAC
    chr1    52196476        52196480        1       +       AGAATATCTTCA
    /**
     * Constructs a new QBed, given a string from tabix
     *
     */
    annotation: any;
    value: number;
    relativeX: number; // Store relative position of QBed in visualizer
    relativeY: number; // Used to find nearest QBed to cursor for tooltip; also for downsampling
    constructor(bedRecord: BedRecord) {
        const locus = new ChromosomeInterval(bedRecord.chr, bedRecord.start, bedRecord.end);
        super('', locus, bedRecord[QBedColumnIndex.STRAND]);
        this.value = Number.parseFloat(bedRecord[QBedColumnIndex.VALUE]);
        this.annotation = bedRecord[QBedColumnIndex.ANNOTATION];
    }
}

export default QBed;
