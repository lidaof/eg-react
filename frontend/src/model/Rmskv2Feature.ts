import Feature from "./Feature";
import ChromosomeInterval from "./interval/ChromosomeInterval";

export interface GmodBbiBigBedFeature {
    chromId: number;
    start: number;
    end: number;
    rest: string;
    uniqueId: string;
    chr: string; // added by us in data source
}

/**
 * A data container for a Rmsk v2 record.
 *
 * @author Daofeng Li
 */
export class Rmskv2Feature extends Feature {
    repClass: string;
    repFamily: string;
    milliDiv: string;
    _value: number;
    rgb: string;

    /*
    Input DASFeature schema
    {
       chr: "chr7"
        chromId: 19
        end: 27042993
        rest: "(AAGACT)n\t0\t+\t27042953\t27042993\t0,0,128\t17\tSimple_repeat\tundefined\t12.0"
        start: 27042953
        uniqueId: "bb-27341896638"
    }
    */
    /**
     * Constructs a new rmskRecord, given a properly-structured GmodBbiBigBedFeature
     *
     * @param {GmodBbiBigBedFeature} record - GmodBbiBigBedFeature to use
     */
    constructor(rmskRecord: GmodBbiBigBedFeature) {
        const locus = new ChromosomeInterval(rmskRecord.chr, rmskRecord.start, rmskRecord.end);
        const parsed = rmskRecord.rest.split("\t");
        super(parsed[0], locus, parsed[2]);
        this.repClass = parsed[7];
        this.repFamily = parsed[8];
        this.milliDiv = parsed[9];
        this.rgb = parsed[5];
        this._value = null;
    }

    get value() {
        if (this._value === null) {
            const divergence = Number.parseFloat(this.milliDiv) / 100.0;
            this._value = 1 - divergence;
        }
        return this._value;
    }

    /**
     * @return {string} human-readable description of the repeat class
     */
    getClassDetails(): string {
        return this.repClass;
    }
}
