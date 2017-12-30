/**
 * A 0-indexed open interval.
 * 
 * @author Silas Hsu
 */
export class OpenInterval {
    /**
     * Makes a new interval.
     * 
     * @param {number} start - start of the interval, inclusive
     * @param {number} end - end of the interval, exclusive
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
