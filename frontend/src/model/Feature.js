import ChromosomeInterval from "./interval/ChromosomeInterval";

export const FORWARD_STRAND_CHAR = "+";
export const REVERSE_STRAND_CHAR = "-";

/**
 * A feature, or annotation, in the genome.
 * 
 * @implements {Serializable}
 * @author Silas Hsu
 */
export class Feature {
    /**
     * Makes a new instance with specified name and locus.  Empty names are valid.  If given `undefined` or `null`, it
     * defaults to the locus as a string.
     * 
     * @param {string} [name] - name of the feature
     * @param {ChromosomeInterval} locus - genomic location of the feature
     * @param {string} strand - strand info
     */
    constructor(name, locus, strand) {
        this.name = name == undefined ? locus.toString() : name; // eslint-disable-line eqeqeq
        this.locus = locus;
        this.strand = strand;
    }

    serialize() {
        return {
            name: this.name,
            locus: this.locus.serialize(),
            strand: this.strand
        }
    }

    static deserialize(object) {
        return new Feature(object.name, ChromosomeInterval.deserialize(object.locus), object.strand);
    }

    /**
     * @return {string} the name of this feature
     */
    getName() {
        return this.name;
    }

    /**
     * @return {ChromosomeInterval} the genomic location of this feature
     */
    getLocus() {
        return this.locus;
    }

    /**
     * @return {number} the length of this feature's locus
     */
    getLength() {
        return this.locus.getLength();
    }

    /**
     * @return {string} raw strand info of this instance
     */
    getStrand() {
        return this.strand;
    }

    /**
     * @return {boolean} whether this feature is on the forward strand
     */
    getIsForwardStrand() {
        return this.strand === FORWARD_STRAND_CHAR;
    }

    /**
     * @return {boolean} whether this feature is on the reverse strand
     */
    getIsReverseStrand() {
        return this.strand === REVERSE_STRAND_CHAR;
    }

    /**
     * @return {boolean} whether this feature has strand info
     */
    getHasStrand() {
        return this.getIsForwardStrand() || this.getIsReverseStrand();
    }

    /**
     * Shortcut for navContext.convertGenomeIntervalToBases().  Computes absolute coordinates occupied by this
     * instance's locus.
     * 
     * @param {NavigationContext} navContext - the navigation context for which to compute coordinates
     * @return {OpenInterval[]} coordinates in the navigation context
     */
    computeNavContextCoordinates(navContext) {
        return navContext.convertGenomeIntervalToBases(this.getLocus());
    }
}

/**
 * Everything a Feature is, plus a `value` prop.
 * 
 * @author Silas Hsu
 */
export class NumericalFeature extends Feature {
    /**
     * Sets value and returns this.
     * 
     * @param {number} value - value to attach to this instance.
     * @return {this}
     */
    withValue(value) {
        this.value = value;
        return this;
    }
}

export default Feature;
