import Feature from "./Feature";
import ChromosomeInterval from "./interval/ChromosomeInterval";
import BedRecord from "../dataSources/bed/BedRecord";

const HEIGHT = 9;

enum PairwiseSegmentColumnIndex {
  SEGMENT = 3
}

/**
 * A data container for a pairwise alignment segment.
 *
 * @author Daofeng Li
 */
class PairwiseSegment extends Feature {
  static HEIGHT = HEIGHT;
  /*
    Input， strings like following
    NC_004718.3     3059    3060    deletion: A
    NC_004718.3     3060    3061    deletion: G
    NC_004718.3     3061    3062    deletion: A
    NC_004718.3     3065    3066    mismatch: T
    NC_004718.3     3066    3067    mismatch: T
    NC_004718.3     3067    3068    mismatch: G
    NC_004718.3     3070    3071    mismatch: A
    NC_004718.3     3076    3077    mismatch: A
    NC_004718.3     3089    3090    insertion: GG
    NC_004718.3     3091    3092    mismatch: G
    NC_004718.3     3093    3094    insertion: CTCA
    /**
     *{
         deletion: A
    }
    {
        mismatch: T
    }
    {
        insertion: CTGA
    }
     }
     */
  segment: object;
  constructor(bedRecord: BedRecord) {
    const locus = new ChromosomeInterval(
      bedRecord.chr,
      bedRecord.start,
      bedRecord.end
    );
    super("", locus, "+");
    const content = bedRecord[PairwiseSegmentColumnIndex.SEGMENT].split(":");
    this.segment = { [content[0].trim()]: content[1].trim() };
  }
}

export default PairwiseSegment;
