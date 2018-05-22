import OpenInterval from './OpenInterval';
import _ from 'lodash';

/**
 * Basically an OpenInterval with a chromosome's name.  Expresses genomic coordinates.
 * 
 * @implements {Serializable}
 * @author Silas Hsu
 */
class ChromosomeInterval {
    /**
     * Parses a string representing a ChromosomeInterval, such as those produced by the toString() method.  Throws an
     * error if parsing fails.
     * 
     * @param {string} string - interval to parse
     * @return {ChromosomeInterval} parsed instance
     * @throws {RangeError} if parsing fails
     */
    static parse(string) {
        const regexMatch = string.match(/([\w:]+):(\d+)-(\d+)/);
        if (regexMatch) {
            const chr = regexMatch[1];
            const start = Number.parseInt(regexMatch[2], 10);
            const end = Number.parseInt(regexMatch[3], 10);
            return new ChromosomeInterval(chr, start, end);
        } else {
            throw new RangeError("Could not parse interval");
        }
    }

    /**
     * Merges all intervals that overlap.  Does not mutate any inputs.
     * 
     * @param {ChromosomeInterval[]} intervals - interval list to inspect for overlaps
     * @return {ChromosomeInterval[]} - version of input list with overlapping intervals merged
     */
    static mergeOverlaps(intervals) {
        const groupedByChr = _.groupBy(intervals, 'chr');
        let allMerged = [];
        for (let chr in groupedByChr) { // Merge intervals by chromosome
            const sorted = groupedByChr[chr].sort((a, b) => a.start - b.start); // Sorted by smallest start first
            let merged = [ sorted[0] ]; // Init with the first interval
            for (let i = 1; i < sorted.length; i++) {
                const prevInterval = merged[merged.length - 1];
                const currInterval = sorted[i];
                if (prevInterval.end < currInterval.start) { // No overlap
                    merged.push(currInterval);
                } else if (prevInterval.end < currInterval.end) { // Overlap, and ends after the previous interval's end
                    // Replace prevInterval with an extended version
                    merged[merged.length - 1] = new ChromosomeInterval(chr, prevInterval.start, currInterval.end);
                }
            }

            for (let interval of merged) {
                allMerged.push(interval);
            }
        }
        return allMerged;
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

    serialize() {
        return this;
    }

    static deserialize(object) {
        return new ChromosomeInterval(object.chr, object.start, object.end);
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
