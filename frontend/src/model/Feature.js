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
    constructor(name, locus, isForwardStrand=true) {
        this._name = name == undefined ? locus.toString() : name; // eslint-disable-line eqeqeq
        this._locus = locus;
        this._isForwardStrand = isForwardStrand;
    }

    serialize() {
        return {
            name: this._name,
            locus: this._locus.serialize(),
            isForwardStrand: this._isForwardStrand
        }
    }

    static deserialize(object) {
        return new Feature(object.name, ChromosomeInterval.deserialize(object.locus), object.isForwardStrand);
    }

    /**
     * @return {string} the name of this feature
     */
    getName() {
        return this._name;
    }

    /**
     * @return {number} the length of this feature
     */
    getLength() {
        return this._locus.getLength();
    }

    /**
     * @return {ChromosomeInterval} the genomic location of this feature
     */
    getLocus() {
        return this._locus;
    }

    /**
     * @return {boolean} whether this feature is on the forward strand
     */
    getIsForwardStrand() {
        return this._isForwardStrand;
    }
}

export default Feature;
