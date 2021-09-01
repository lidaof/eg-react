import Feature from "./Feature";
import ChromosomeInterval from "./interval/ChromosomeInterval";

/**
 * A data container for a vcf object.
 *
 * @author Daofeng Li
 */

export interface Variant {
    ALT: string[];
    REF: string;
    CHROM: string;
    POS: number;
    FILTER: any;
    ID: any;
    INFO: any;
    QUAL: number;
    SAMPLES: any;
}

class Vcf extends Feature {
    /*
     Variant
        ALT: ["C"]
        CHROM: "chr7"
        FILTER: null
        ID: null
        INFO:
            AC: [2]
            AF: [1]
            AN: [2]
            DP: [45]
            ExcessHet: [3.0103]
            FS: [0]
            MLEAC: [2]
            MLEAF: [1]
            MQ: [60]
            QD: [32.97]
            SOR: [0.737]
            __proto__: Object
        POS: 27086705
        QUAL: 1483.77
        REF: "T"
        SAMPLES: Object
            NA12878_N28_300ng:
            AD: (2) [0, 45]
            DP: [45]
            GQ: [99]
            GT: ["1/1"]
            PL: (3) [1512, 135, 0]
            __proto__: Object
    /**
     * Constructs a new Vcf, given a variant object from @gmod/vcf
     *
     */
    // ref: string;
    // alt: any[];
    // quality: number;
    // info: any;
    // samples?: any;
    variant: Variant;
    constructor(variant: any) {
        const locus = new ChromosomeInterval(variant.CHROM, variant.POS - 1, variant.POS - 1 + variant.REF.length);
        super("", locus);
        // super(variant.ID ? variant.ID : "", locus);
        // this.info = variant.INFO;
        // this.ref = variant.REF;
        // this.alt = variant.ALT;
        // this.quality = variant.QUAL;
        // this.samples = variant.SAMPLES;
        this.variant = variant;
    }
}

export default Vcf;
