import Feature from "../Feature";
import ChromosomeInterval from "../interval/ChromosomeInterval";
import { GAP_CHAR } from "./AlignmentStringUtils";

/**
 * A data container for a GenomeAlign record.
 *
 * @author Daofeng Li
 */
export class BigChainAlignmentRecord extends Feature {
    /**
     * Constructs a new BigChainAlignmentRecord, given a record from genomealignment source
     *
     */
    queryLocus: ChromosomeInterval;
    targetSeq: string;
    querySeq: string;
    queryStrand: string;

    constructor(record: any) {
        const locus = new ChromosomeInterval(record.chr, record.start, record.end);
        const rest = record.rest.split("\t");
        // console.log(record);
        super(record.uniqueId, locus, rest[2]);
        this.queryLocus = new ChromosomeInterval(rest[4], Number.parseInt(rest[6], 10), Number.parseInt(rest[7], 10));
        this.querySeq = "";
        this.targetSeq = "";
        this.queryStrand = "+";
    }

    getIsReverseStrandQuery() {
        return this.queryStrand === GAP_CHAR;
    }
}

export default BigChainAlignmentRecord;
