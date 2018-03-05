import OpenInterval from './OpenInterval';

/**
 * Basically an OpenInterval with a chromosome's name.  Expresses genomic coordinates.
 * 
 * @author Silas Hsu
 */
class ChromosomeInterval {
    /**
     * Parses a string representing a ChromosomeInterval, such as those produced by the toString() method.  Returns null
     * if parsing fails.
     * 
     * @param {string} string - interval to parse
     * @return {ChromosomeInterval} parsed instance, or null
     */
    static parse(string) {
        const regexMatch = string.match(/([\w:]+):(\d+)-(\d+)/);
        // eslint-disable-next-line no-cond-assign
        if (regexMatch) {
            const chr = regexMatch[1];
            const start = Number.parseInt(regexMatch[2], 10);
            const end = Number.parseInt(regexMatch[3], 10);
            return new ChromosomeInterval(chr, start, end);
        } else {
            return null;
        }
    }

    /**
     * Makes a new instance.  The input interval should be a 0-indexed open one.
     * 
     * @param {string} chr - name of the chromosome
     * @param {number} start - start of the interval, inclusive
     * @param {number} end - end of the interval, exclusive
     */
    constructor(chr, start, end) {
        this.chr = chr;
        this.start = start;
        this.end = end;
    }

    *[Symbol.iterator] () {
        yield this.start;
        yield this.end;
    }

    /**
     * @return {number} the length of this interval in base pairs
     */
    getLength() {
        return this.end - this.start;
    }

    /**
     * Intersects this and another ChromosomeInterval, and returns the result in as a new ChromosomeInterval.  Returns
     * null if there is no intersection at all.
     * 
     * @param {ChromosomeInterval} other - other ChromosomeInterval to intersect
     * @return {ChromosomeInterval} intersection of this and the other interval, or null if none exists
     */
    getOverlap(other) {
        if (this.chr !== other.chr) {
            return null
        } else {
            const overlap = new OpenInterval(...this).getOverlap(new OpenInterval(...other));
            return overlap ? new ChromosomeInterval(this.chr, ...overlap) : null;
        }
    }

    /**
     * @return {string} human-readable representation of this interval
     */
    toString() {
        return `${this.chr}:${this.start}-${this.end}`;
    }

    /**
     * Interprets this and another interval as a multi-chromosome interval, with this being the start and the other
     * being the end.  Returns a human-readable representation of that interpretation.
     * 
     * @param {ChromosomeInterval} other - the "end" of the multi-chromosome interval
     * @return {string} a human-readable representation of a multi-chromosome interval
     */
    toStringWithOther(other) {
        return `${this.chr}:${this.start}-${other.chr}:${other.end}`;
    }
}

export default ChromosomeInterval;
