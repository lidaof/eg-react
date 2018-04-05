import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';

const CLASS_TO_ID = {
    "SINE": 1,
    "SINE?": 1,
    "LINE": 2,
    "LINE?": 2,
    "LTR": 3,
    "LTR?": 3,
    "DNA": 4,
    "DNA?": 4,
    "RC": 4,
    "RC?": 4,
    "Simple_repeat": 5,
    "Satellite": 6,
    "Satellite?": 6,
    "Low_complexity": 7,
    "RNA": 8,
    "rRNA": 8,
    "scRNA": 8,
    "snRNA": 8,
    "srpRNA": 8,
    "tRNA": 8,
    "ncRNA": 8,
    "Other": 9,
    "Unknown": 10,
    "Unknown?": 10,
    "Retroposon": 11,
    "Retrotransposon": 11,
    "ARTEFACT": 12,
};

/**
 * A data container for a RepeatMasker record.
 * 
 * @author Daofeng Li
 */
class RepeatMaskerRecord extends Feature {
    /*
    Input DASFeature schema
    {
        genoLeft: "-132404898"
        label: "AT_rich"
        max: 26733765
        milliDel: "0"
        milliDiv: "71"
        milliIns: "0"
        min: 26733724
        orientation: "+"
        repClass: "Low_complexity"
        repEnd: "42"
        repFamily: "Low_complexity"
        repLeft: "0"
        repStart: "1"
        score: 0
        segment: "chr7"
        swScore: "21"
        type: "bigbed"
        _chromId: 41
    }
    */
    /**
     * Constructs a new rmskRecord, given a properly-structured DASFeature
     *
     * @param {DASFeature} record - DASFeature to use
     */
    constructor(rmskRecord) {
        const location = new ChromosomeInterval(rmskRecord.segment, rmskRecord.min, rmskRecord.max);
        super(rmskRecord.label, location, rmskRecord.orientation === "+");
        this.repClass = rmskRecord.repClass;
        this.repFamily = rmskRecord.repFamily;
        this.swScore = Number.parseInt(rmskRecord.swScore, 10);
        this.milliDel = Number.parseInt(rmskRecord.milliDel, 10);
        this.milliDiv = Number.parseInt(rmskRecord.milliDiv, 10);
        this.milliIns = Number.parseInt(rmskRecord.milliIns, 10);
        this.swScoreNormByLength = _.round(this.swScore/this.getLength(), 2);
        this.divergence = _.round(this.milliDiv/1000.0, 1);
        this.deletion = _.round(this.milliDel/1000.0, 1);
        this.insertion = _.round(this.milliIns/1000.0, 1);
        this.oneMinusDivergence =  1 - this.divergence; 
    }

}

export default RepeatMaskerRecord;
