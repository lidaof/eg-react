interface IOpenInterval {
    start: number;
    end: number;
}

/**
 * A 0-indexed open interval.  Intervals are iterable, so code can take advantage of the spread operator:
 *     `myFunction(...interval)` is equivalent to `myFunction(interval.start, interval.end)`
 * 
 * @implements {Serializable}
 * @author Silas Hsu
 */
export default class OpenInterval implements IOpenInterval {
    /**
     * Makes a new instance.  The input should be a 0-indexed open one.
     * 
     * @param {number} start - start of the interval, inclusive
     * @param {number} end - end of the interval, exclusive
     * @throws {RangeError} if the end is less than the start
     */
    
    constructor(public start: number, public end: number) {
        if (end < start) {
            throw new RangeError("End cannot be less than start");
        }
        this.start = start;
        this.end = end;
    }


    /**
     * 
     *
     * @returns {IOpenInterval}
     * @memberof OpenInterval
     */
    serialize(): IOpenInterval {
        return {
            start: this.start,
            end: this.end,
        };
    }


    /**
     * Creates an OpenInterval from an object or array
     *
     * @static
     * @param {(number[] | IOpenInterval)} object
     * @returns
     * @memberof OpenInterval
     */
    static deserialize(object: number[] | IOpenInterval) {
        if (Array.isArray(object)) {
            return new OpenInterval(object[0], object[1]);
        }
        return new OpenInterval(object.start, object.end);
    }

    *[Symbol.iterator] () {
        yield this.start;
        yield this.end;
    }

    /**
     * Intersects this and another OpenInterval, and returns the result in as a new OpenInterval.  Returns null if there
     * is no intersection at all.
     * 
     * @param {OpenInterval} other - other OpenInterval to intersect
     * @return {OpenInterval} intersection of this and the other interval
     */
    getOverlap(other: OpenInterval) : OpenInterval {
        const intersectionStart = Math.max(this.start, other.start);
        const intersectionEnd = Math.min(this.end, other.end);
        if (intersectionStart < intersectionEnd) {
            return new OpenInterval(intersectionStart, intersectionEnd);
        } else {
            return null;
        }
    }

    /**
     * @return {number} the length of this interval
     */
    getLength(): number {
        return this.end - this.start;
    }

    /**
     * @return {string} human-readable representation of this instance
     */
    toString(): string {
        return `[${this.start}, ${this.end})`;
    }
}
