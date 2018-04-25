import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';


const DEFAULT_CONTEXT_COLORS = {
    "CG": {color: "rgb(100,139,216)", background: "#d9d9d9"},
    "CHG": {color: "rgb(255,148,77)", background: "#ffe0cc"},
    "CHH": {color: "rgb(255,0,255)", background: "#ffe5ff"},
};

const DEFAULT_COUNT_COLOR = "#525252";

/**
 * A data container for a MethylC record.
 * 
 * @author Daofeng Li
 */
class MethylCRecord extends Feature {
    static DEFAULT_CONTEXT_COLORS = DEFAULT_CONTEXT_COLORS;
    static DEFAULT_COUNT_COLOR = DEFAULT_COUNT_COLOR;
    /*
    Input， strings like following
    chrX	2709724	2709725	CHH/0.111/9/-
    chrX	2709728	2709729	CG/0.875/8/-
    chrX	2709767	2709768	CHG/0.059/17/-
    /**
     * Constructs a new MethylCRecord, given a string from tabix
     *
     */
    constructor(tabixRecord) {
        const eles = _.split(tabixRecord, "\t");
        const locus = new ChromosomeInterval(eles[0], Number.parseInt(eles[1], 10), Number.parseInt(eles[2], 10));
        const meths = _.split(eles[3], '/');
        super('', locus, meths[3] === "+");
        this.context = meths[0]; //context of the cytosine (CG, CHG, CHH, where H = A, C, or T)
        this.value = Number.parseFloat(meths[1]); // methylation value, from 0 to 1
        this.count = Number.parseInt(meths[2], 10); // read depth
    }

    /**
     * @return {number} the 1 - divergence% value
     */
    getValue() {
        return this.value;
    }

    getLocus() {
        return this._locus;
    }

    getContext() {
        return this.context;
    }
}

// combineSites = (bag) => { //bag is array of methylcRecord on sites belong to one CG, CHG or CHH
//    if (bag.length === 1) {
//        //change end to start +2 or +3 depending on context
//        //constructor the string?
//    } else {
//     //do math

//    }
// }

// combineMethyCRecords = (records) => {
//     //records need be sorted, since the records were obtained from tabix, they are already sorted
//     let results = [];
//     for (let record of records) {
//         if (record._isForwardStrand) { //first base in CG
//             //make bags
//         }
//     }
//     return ;
// }

export default MethylCRecord;
