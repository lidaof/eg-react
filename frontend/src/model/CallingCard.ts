import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import BedRecord from '../dataSources/bed/BedRecord';

enum CallingCardColumnIndex {
    VALUE=3,
    STRAND=4,
    ANNOTATION=5
};


/**
 * A data container for a calling card.
 * 
 * @author Daofeng Li and Arnav Moudgil
 */
class CallingCard extends Feature {
    /*
    Input， strings like following
    chr1    51441754        51441758        1       -       CTAGAGACTGGC
    chr1    51441754        51441758        21      -       CTTTCCTCCCCA
    chr1    51982564        51982568        3       +       CGCGATCGCGAC
    chr1    52196476        52196480        1       +       AGAATATCTTCA
    /**
     * Constructs a new CallingCard, given a string from tabix
     *
     */
    annotation: any;
    value: number;
    relativeX: number; // Store relative position of CallingCard in visualizer
    relativeY: number; // Used to find nearest CallingCard to cursor for tooltip; also for downsampling
    constructor(bedRecord: BedRecord) {
        const locus = new ChromosomeInterval(bedRecord.chr, bedRecord.start, bedRecord.end);
        super('', locus, bedRecord[CallingCardColumnIndex.STRAND]);
        this.value = Number.parseFloat(bedRecord[CallingCardColumnIndex.VALUE]);
        this.annotation = bedRecord[CallingCardColumnIndex.ANNOTATION];
    }
}

export default CallingCard;
