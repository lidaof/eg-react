import ChromosomeInterval, { IChromosomeInterval } from "./interval/ChromosomeInterval";
import NavigationContext from "./NavigationContext";

type Strand = "+" | "-" | string;

/**
 * The properties of Feature without the methods.
 */
export interface IFeature {
    name: string;
    locus: IChromosomeInterval;
    strand: Strand;
}

export const FORWARD_STRAND_CHAR = "+";
export const REVERSE_STRAND_CHAR = "-";

/**
 * A feature, or annotation, in the genome.
 *
 * @implements {Serializable}
 * @author Silas Hsu
 */
export class Feature {
    name: string; // - name of the feature
    /**
     * Makes a new instance with specified name and locus.  Empty names are valid.  If given `undefined` or `null`, it
     * defaults to the locus as a string.
     *
     * @param {string} [name] - name of the feature
     * @param {ChromosomeInterval} locus - genomic location of the feature
     * @param {Strand} strand - strand info
     */
    constructor(name: string, public locus: ChromosomeInterval, public strand: Strand = "") {
        this.name = name === undefined ? locus.toString() : name; // eslint-disable-line eqeqeq
        this.locus = locus;
        this.strand = strand;
    }

    serialize(): IFeature {
        return {
            name: this.name,
            locus: this.getLocus().serialize(),
            strand: this.strand
        };
    }

    static deserialize(object: IFeature) {
        return new Feature(object.name, ChromosomeInterval.deserialize(object.locus), object.strand);
    }

    /**
     * @return {string} the name of this feature
     */
    getName(): string {
        return this.name;
    }

    /**
     * @return {ChromosomeInterval} the genomic location of this feature
     */
    getLocus(): ChromosomeInterval {
        return this.locus;
    }

    /**
     * @return {number} the length of this feature's locus
     */
    getLength(): number {
        return this.locus.getLength();
    }

    /**
     * @return {string} raw strand info of this instance
     */
    getStrand(): Strand {
        return this.strand;
    }

    /**
     * @return {boolean} whether this feature is on the forward strand
     */
    getIsForwardStrand(): boolean {
        return this.strand === FORWARD_STRAND_CHAR;
    }

    /**
     * @return {boolean} whether this feature is on the reverse strand
     */
    getIsReverseStrand(): boolean {
        return this.strand === REVERSE_STRAND_CHAR;
    }

    /**
     * @return {boolean} whether this feature has strand info
     */
    getHasStrand(): boolean {
        return this.getIsForwardStrand() || this.getIsReverseStrand();
    }

    /**
     * Shortcut for navContext.convertGenomeIntervalToBases().  Computes nav context coordinates occupied by this
     * instance's locus.
     *
     * @param {NavigationContext} navContext - the navigation context for which to compute coordinates
     * @return {OpenInterval[]} coordinates in the navigation context
     */
    computeNavContextCoordinates(navContext: NavigationContext) {
        return navContext.convertGenomeIntervalToBases(this.getLocus());
    }
}

/**
 * Everything a Feature is, plus a `value` prop.
 *
 * @author Silas Hsu
 */
export class NumericalFeature extends Feature {
    value: number;

    /**
     * Sets value and returns this.
     *
     * @param {number} value - value to attach to this instance.
     * @return {this}
     */
    withValue(value: number): this {
        this.value = value;
        return this;
    }
}

/**
 * Everything a Feature is, plus a `values` prop.
 *
 * @author Daofeng Li
 */
export class NumericalArrayFeature extends Feature {
    values: number[];

    /**
     * Sets values and returns this.
     *
     * @param {number[]} values - value to attach to this instance.
     * @return {this}
     */
    withValues(values: readonly number[]): this {
        this.values = values.slice();
        return this;
    }
}

export default Feature;
