/**
 * Something with props `start` and `end` which represent a 0-indexed open interval
 */
export interface IOpenInterval {
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
     * Makes a new instance.  The input should represent a 0-indexed open interval.
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
     * @returns {IOpenInterval}
     */
    serialize(): IOpenInterval {
        return this;
    }

    /**
     * Creates an OpenInterval from an object.
     *
     * @param {IOpenInterval} object - object to use
     * @return {OpenInterval} OpenInterval created from the object
     */
    static deserialize(object: IOpenInterval): OpenInterval {
        return new OpenInterval(object.start, object.end);
    }

    /**
     * Enables the spread operator for OpenIntervals.
     */
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
    getOverlap(other: OpenInterval): OpenInterval {
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
