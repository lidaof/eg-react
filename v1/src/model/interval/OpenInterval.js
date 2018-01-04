/**
 * A 0-indexed open interval.  Intervals are iterable, so code can take advantage of the spread operator:
 *     `myFunction(...interval)` is equivalent to `myFunction(interval.start, interval.end)`
 * 
 * @author Silas Hsu
 */
export class OpenInterval {
    /**
     * Makes a new instance.  The input should be a 0-indexed open one.
     * 
     * @param {number} start - start of the interval, inclusive
     * @param {number} end - end of the interval, exclusive
     * @throws {RangeError} if the end is less than the start
     */
    constructor(start, end) {
        if (end < start) {
            throw new RangeError("End cannot be less than start");
        }
        this.start = start;
        this.end = end;
    }

    *[Symbol.iterator] () {
        yield this.start;
        yield this.end;
    }

    /**
     * @return {number} the length of this interval
     */
    getLength() {
        return this.end - this.start;
    }
}

export default OpenInterval;
