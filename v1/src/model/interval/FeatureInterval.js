import ChromosomeInterval from './ChromosomeInterval';

class FeatureInterval {
    /**
     * 
     * @param {Feature} feature 
     * @param {number} start 
     * @param {number} end 
     */
    constructor(feature, start, end) {
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
        throw new Error("FeatureInterval has no prop `start`.  Use `relativeStart` instead.");
    }

    get end() {
        throw new Error("FeatureInterval has no prop `end`.  Use `relativeEnd` instead.");
    }

    isValidBase(base) {
        return 0 <= base && base <= this.feature.getLength();
    }

    getName() {
        return this.feature.getName();
    }

    getLength() {
        return this.relativeEnd - this.relativeStart;
    }

    /**
     * @return {ChromosomeInterval}
     */
    getGenomeCoordinates() {
        const featureLocation = this.feature.getCoordinates();
        return new ChromosomeInterval(
            featureLocation.chr,
            featureLocation.start + this.relativeStart,
            featureLocation.start + this.relativeEnd
        );
    }

    getOverlap(chrInterval) {
        const featureLocation = this.feature.getCoordinates();
        const genomeLocation = this.getGenomeCoordinates();
        const overlap = genomeLocation.getOverlap(chrInterval);
        if (!overlap) {
            return null;
        }
        const relativeStart = overlap.start - featureLocation.start;
        const relativeEnd = overlap.end - featureLocation.start;
        return new FeatureInterval(this.feature, relativeStart, relativeEnd);
    }

    toString() {
        return `${this.getName()}:${this.relativeStart}-${this.relativeEnd}`;
    }

    /**
     * 
     * @param {Feature} other - the "end" of the multi-chromosome interval
     * @return {string} a human-readable representation of a multi-feature interval
     */
    toStringWithOther(other) {
        return `${this.getName()}:${this.relativeStart}-${other.getName()}:${other.relativeEnd}`;
    }
}

export default FeatureInterval;
