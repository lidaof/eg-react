import OpenInterval from './OpenInterval';

/**
 * An OpenInterval with a chromosome's name.  Expresses genomic coordinates.
 * 
 * @author Silas Hsu
 */
class ChromosomeInterval extends OpenInterval {
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
        super(start, end);
        this.chr = chr;
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
            return null;
        }
        const intersectionStart = Math.max(this.start, other.start);
        const intersectionEnd = Math.min(this.end, other.end);
        if (intersectionStart < intersectionEnd) {
            return new ChromosomeInterval(this.chr, intersectionStart, intersectionEnd);
        }

        return null;
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
