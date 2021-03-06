import Feature from "./Feature";
import ChromosomeInterval from "./interval/ChromosomeInterval";

/**
 * A data container for a qBED object.
 *
 * @author Daofeng Li and Arnav Moudgil
 */
class Rgbpeak extends Feature {
    /*
    Input， strings like following
    chr10	46092019	46092519	chr10_46092019	537	.	46092019	46092519	117,117,117
    chr10	47253553	47254053	chr10_47253553	748	.	47253553	47254053	107,107,107
    chr10	48944302	48944802	chr10_48944302	566	.	48944302	48944802	117,117,117

    bbi-js parsed to:

    itemRgb: "rgb(117,117,117)"
    label: "chr10_46092019"
    max: 46092519
    min: 46092019
    orientation: "."
    score: 537
    segment: "chr10"
    type: "bigbed"
    _chromId: 1

    /**
     * Constructs a new Rgbpeak, given a string from bigbed
     *
     */
    itemRgb: string;
    score: number;
    constructor(record: any) {
        const locus = new ChromosomeInterval(record.segment, record.min, record.max);
        super(record.label || "", locus, record.orientation);
        this.itemRgb = record.itemRgb || "blue";
        this.score = record.score;
    }
}

export default Rgbpeak;
