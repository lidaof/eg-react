import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import _ from 'lodash';

/**
 * A data container for a rmsk record.
 * 
 * @author Daofeng Li
 */

export class Rmsk extends Feature {
    /**
     * Constructs a new rmskRecord, given an entry dasFeature queried from bigBed.  
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
     * @param {rmskRecord} record - refGeneRecord object to use
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
    }

    

    /**
     * display details when click a rmsk
     */
    getDescription() {
        return this.name;
    }

}

export default Rmsk;
