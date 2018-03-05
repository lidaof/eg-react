import ChromosomeInterval from './ChromosomeInterval';

/**
 * A 0-indexed open interval within a Feature.  Or, put another way, attaches an interval to a Feature.
 * 
 * @author Silas Hsu
 * @see Feature
 */
class FeatureInterval {
    /**
     * Makes a new instance, attaching a interval to a Feature.  If start and end are not provided, the interval
     * defaults to the entire length of the feature.  The start and end parameters should express a *0-indexed open
     * interval*.
     * 
     * @param {Feature} feature - the interval's feature
     * @param {number} [start] - start base of the interval, relative to the feature's start
     * @param {number} [end] - end base of the interval, relative to the feature's start
     * @throws {RangeError} if end is before start or the interval lies outside the feature
     */
    constructor(feature, start=0, end) {
        if (end === undefined) {
            end = feature.getLength();
        }
        if (end < start) {
            throw new RangeError("End cannot be less than start");
        }
        this.feature = feature;
        this.relativeStart = start;
        this.relativeEnd = end;

        if (!this.isValidBase(start)) {
            throw new RangeError(`Start base ${start} not in feature`);
        }
        if (!this.isValidBase(end)) {
            throw new RangeError(`End base ${end} not in feature`);
        }
    }

    get start() {
        console.error("FeatureInterval has no prop `start`.  Use `relativeStart` instead.");
        return this.relativeStart;
    }

    get end() {
        console.error("FeatureInterval has no prop `end`.  Use `relativeEnd` instead.");
        return this.relativeEnd;
    }

    /**
     * Gets whether a relative base lies within this interval's feature.
     * 
     * @param {number} base - base number relative to the feature's start
     * @return {boolean} whether the base lies within this interval's feature.
     */
    isValidBase(base) {
        return 0 <= base && base <= this.feature.getLength();
    }

    /**
     * @return {string} the attached feature's name
     */
    getName() {
        return this.feature.getName();
    }

    /**
     * @return {number} this interval's length
     */
    getLength() {
        return this.relativeEnd - this.relativeStart;
    }

    /**
     * Gets the genomic location of this interval, considering both the attached Feature's location and this interval.
     * 
     * @return {ChromosomeInterval} genomic location of this interval
     */
    getGenomeCoordinates() {
        const featureLocus = this.feature.getLocus();
        return new ChromosomeInterval(
            featureLocus.chr,
            featureLocus.start + this.relativeStart,
            featureLocus.start + this.relativeEnd
        );
    }

    /**
     * Intersects this and a genome location, and returns the result as a new FeatureInterval using the same Feature
     * that is attached to this.  Returns null if the genome location does not intersect with this location at all.
     * 
     * @param {ChromosomeInterval} chrInterval - input genome location
     * @return {FeatureInterval} intersection of this and the input genomic location
     */
    getOverlap(chrInterval) {
        const featureLocus = this.feature.getLocus();
        const genomeLocation = this.getGenomeCoordinates();
        const overlap = genomeLocation.getOverlap(chrInterval);
        if (!overlap) {
            return null;
        }
        const relativeStart = overlap.start - featureLocus.start;
        const relativeEnd = overlap.end - featureLocus.start;
        return new FeatureInterval(this.feature, relativeStart, relativeEnd);
    }

    /**
     * @return {string} human-readable representation of this interval
     */
    toString() {
        return `${this.getName()}:${this.relativeStart}-${this.relativeEnd}`;
    }

    /**
     * Interprets this and another interval as a multi-feature interval, with this being the start and the other being
     * the end.  Returns a human-readable representation of that interpretation.
     * 
     * @param {FeatureInterval} other - the end of the multi-feature interval
     * @return {string} a human-readable representation of a multi-feature interval
     */
    toStringWithOther(other) {
        return `${this.getName()}:${this.relativeStart}-${other.getName()}:${other.relativeEnd}`;
    }
}

export default FeatureInterval;
