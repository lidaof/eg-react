import Feature from "./Feature";
import ChromosomeInterval from "./interval/ChromosomeInterval";
import BedRecord from "../dataSources/bed/BedRecord";

enum SnvSegmentColumnIndex {
    SNV_TYPE = 3,
}

/**
 * A data container for a snvsegment.
 *
 * @author Daofeng Li
 */
class SnvSegment extends Feature {
    /*
    Input， strings like following
NC_045512.2     0       16      un_sequenced            un_sequenced
NC_045512.2     240     241     noncoding_mismatch      mismatch: T     NC_045512.2:240-241 | ORF:noncoding | C > T | noncoding_mismatch
NC_045512.2     3036    3037    silent  mismatch: T     NC_045512.2:3034-3037 | ORF1ab:F924 | TTC > TTT | F > F | silent ; NC_045512.2:3034-3037 | ORF1a:F924 | TTC > TTT | F > F | silent
NC_045512.2     14407   14408   missense        mismatch: T     NC_045512.2:14406-14409 | ORF1ab:P4715 | CCT > CTT | P > L | missense
NC_045512.2     23402   23403   missense        mismatch: G     NC_045512.2:23401-23404 | S:D614 | GAT > GGT | D > G | missense
NC_045512.2     29872   29903   un_sequenced            un_sequenced
     */
    snvType: string;
    snvData: string[];
    constructor(bedRecord: BedRecord) {
        const locus = new ChromosomeInterval(bedRecord.chr, bedRecord.start, bedRecord.end);
        super("", locus, "+");
        this.snvType = bedRecord[SnvSegmentColumnIndex.SNV_TYPE];
        this.snvData = [];
        let i = SnvSegmentColumnIndex.SNV_TYPE + 1;
        while (bedRecord.hasOwnProperty(i)) {
            this.snvData.push(bedRecord[i]);
            i++;
        }
    }
}

export default SnvSegment;
