import ChromosomeInterval from "./interval/ChromosomeInterval";

/**
 * A feature, or annotation, in the genome.
 * 
 * @implements {Serializable}
 * @author Silas Hsu
 */
class Feature {
    /**
     * Makes a new instance with specified name and locus.  If no name is given, it defaults to the locus as a string.
     * 
     * @param {string} [name] - name of the feature
     * @param {ChromosomeInterval} locus - genomic location of the feature
     * @param {boolean} [isForwardStrand] - whether this feature is on the forward strand.  Default: true
     */
    constructor(name, locus, strand) {
        this._name = name == undefined ? locus.toString() : name; // eslint-disable-line eqeqeq
        this._locus = locus;
        this._strand = strand;
    }

    serialize() {
        return {
            name: this._name,
            locus: this._locus.serialize(),
            strand: this._strand
        }
    }

    static deserialize(object) {
        return new Feature(object.name, ChromosomeInterval.deserialize(object.locus), object.strand);
    }

    /**
     * @return {string} the name of this feature
     */
    getName() {
        return this._name;
    }

    /**
     * @return {ChromosomeInterval} the genomic location of this feature
     */
    getLocus() {
        return this._locus;
    }

    /**
     * @return {number} the length of this feature's locus
     */
    getLength() {
        return this._locus.getLength();
    }

    /**
     * @return {string} raw strand info of this instance
     */
    getStrand() {
        return this._strand;
    }

    /**
     * @return {boolean} whether this feature is on the forward strand
     */
    getIsForwardStrand() {
        return this._strand === "+";
    }

    /**
     * @return {boolean} whether this feature is on the reverse strand
     */
    getIsReverseStrand() {
        return this._strand === "-";
    }

    /**
     * @return {boolean} whether this feature has strand info
     */
    getHasStrand() {
        return this.getIsForwardStrand() || this.getIsReverseStrand();
    }

    /**
     *
     * @param {NavigationContext} navContext 
     * @return {OpenInterval[]} 
     */
    computeNavContextCoordinates(navContext) {
        const absLocations = navContext.convertGenomeIntervalToBases(this.getLocus());
        for (let interval of absLocations) {
            interval.feature = this;
        }
        return absLocations;
    }
}

export default Feature;
