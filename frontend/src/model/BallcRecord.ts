import Feature from "./Feature";
import ChromosomeInterval from "./interval/ChromosomeInterval";
import _ from "lodash";

interface AggregationByRecordsResult {
    depth: number; // mean of depth
    contextValues: Array<{
        context: string;
        value: number; // mean of context value
    }>;
}

export interface BallcItem {
    chr: string;
    pos: number;
    ref_id: number;
    cov: number;
    mc: number;
}

/**
 * A data container for a MethylC record.
 *
 * @author Daofeng Li
 */
class BallcRecord extends Feature {
    /**
     * Combines all BallcRecords that (presumably) are in one pixel.  See schema below the function for return schema.
     * If passed an empty array, returns null.
     *
     * @param {BallcRecord[]} records
     * @return {AggregationResult}
     */
    static aggregateRecords(records: BallcRecord[]): AggregationByRecordsResult {
        if (records.length === 0) {
            return null;
        }
        const depth = _.meanBy(records, "depth");
        const groupedByContext = _.groupBy(records, "context");
        const contextValues = [];
        for (const contextName in groupedByContext) {
            const recordsOfThatContext = groupedByContext[contextName];
            contextValues.push({
                context: contextName,
                value: _.meanBy(recordsOfThatContext, "value"),
            });
        }
        return {
            depth,
            contextValues,
        };
    }
    /*
    {
        depth: 5,
        contextValues: [
            {context: "CG", value: 0.3},
            {context: "CHH", value: 0.3},
            {context: "CHG", value: 0.3},
        ]
    }
    */

    /*
    Input， object like following
    chr
: 
"chr7"
cov
: 
1
mc
: 
0
pos
: 
27693743
ref_id
: 
6
    /**
     * Constructs a new BallcRecord, given a raw ballc object
     *
     */
    context: any;
    value: number;
    depth: number;
    constructor(rawBallcItem: BallcItem) {
        const locus = new ChromosomeInterval(rawBallcItem.chr, rawBallcItem.pos, rawBallcItem.pos + 1);
        super("", locus, "+");
        this.context = "CG";
        this.value = rawBallcItem.mc; // methylation value, from 0 to 1
        this.depth = rawBallcItem.cov; // read depth
    }
}

export default BallcRecord;
