import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';


const DEFAULT_CONTEXT_COLORS = {
    "CG": { color: "rgb(100,139,216)", background: "#d9d9d9" },
    "CHG": { color: "rgb(255,148,77)", background: "#ffe0cc" },
    "CHH":  {color: "rgb(255,0,255)", background: "#ffe5ff" },
};

const DEFAULT_COUNT_COLOR = "#525252";
const RecordInfoIndices = {
    CONTEXT: 0,
    VALUE: 1,
    DEPTH: 2,
    STRAND: 3
};

/**
 * A data container for a MethylC record.
 * 
 * @author Daofeng Li
 */
class MethylCRecord extends Feature {
    static DEFAULT_CONTEXT_COLORS = DEFAULT_CONTEXT_COLORS;
    static DEFAULT_COUNT_COLOR = DEFAULT_COUNT_COLOR;

    /**
     * Combines all MethylCRecords that (presumably) are in one pixel.  See schema below the function for return schema.
     * If passed an empty array, returns null.
     * 
     * @param {MethylCRecord[]} records 
     * @return {Object}
     */
    static aggregateRecords(records) {
        if (records.length === 0) {
            return null;
        }
        const depth = _.meanBy(records, 'depth');
        const groupedByContext = _.groupBy(records, 'context');
        let contextValues = [];
        for (let contextName in groupedByContext) {
            const recordsOfThatContext = groupedByContext[contextName];
            contextValues.push({
                context: contextName,
                value: _.meanBy(recordsOfThatContext, 'value'),
            });
        }
        return {
            depth: depth,
            contextValues: contextValues
        }
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

    /**
     * Combines all MethylCRecords that (presumably) are in one pixel.  See schema below the function for return schema.
     * 
     * @param {MethylCRecord[]} records 
     * @return {Object}
     */
    static aggregateByStrand(records) {
        let [forwardStrandRecords, reverseStrandRecords] = _.partition(records, record => record.getIsForwardStrand());
        return {
            combined: MethylCRecord.aggregateRecords(records),
            forward: MethylCRecord.aggregateRecords(forwardStrandRecords),
            reverse: MethylCRecord.aggregateRecords(reverseStrandRecords)
        };
        /*
        {
            combined: {},
            forward: {},
            reverse: {}
        }
        */
    }

    /*
    Input， strings like following
    chrX	2709724	2709725	CHH/0.111/9/-
    chrX	2709728	2709729	CG/0.875/8/-
    chrX	2709767	2709768	CHG/0.059/17/-
    /**
     * Constructs a new MethylCRecord, given a string from tabix
     *
     */
    constructor(bedRecord) {
        const locus = new ChromosomeInterval(bedRecord.chr, bedRecord.start, bedRecord.end);
        const datas = _.split(bedRecord[3], '/');
        super('', locus, datas[RecordInfoIndices.STRAND]);
        this.context = datas[RecordInfoIndices.CONTEXT]
        this.value = Number.parseFloat(datas[RecordInfoIndices.VALUE]); // methylation value, from 0 to 1
        this.depth = Number.parseInt(datas[RecordInfoIndices.DEPTH], 10); // read depth
    }
}

export default MethylCRecord;
