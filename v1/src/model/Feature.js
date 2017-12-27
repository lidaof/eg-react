import Interval from './Interval';

/**
 * An interval with arbitrary data attached, and additional features (no pun intended).  Since arbitrary data can be put
 * into a Feature, it can represent different things in different contexts.  For example:
 * 
 * - A Feature with another Feature in its `details` prop suggests a relative interval; an indexing relative to the
 * start of another feature.
 * - A Feature with its `details` prop set to a string literal can be used to look up Features with matching names in
 * certain APIs.
 * 
 * In addition, to avoid off-by-one errors, the get0Indexed or get1Indexed methods are required to retrieve the
 * internally-stored interval.
 * 
 * @author Silas Hsu
 */
class Feature {
    /**
     * If a Feature has been serialized, for instance via JSON.stringify and then JSON.parse, this function will restore
     * Feature's methods on such an object.
     * 
     * @param {Object} obj - object with which to construct a Feature
     * @return {Feature} constructed Feature
     */
    static deserialize(obj) {
        let details = obj._details;
        // Does obj.details "look like" a Feature?  If so, deserialize it too.
        if (typeof details === "object" && typeof details._start === "number" && typeof details._end === "number") {
            details = Feature.deserialize(details);
        }
        return new Feature(details, obj._start, obj._end, true);
    }

    /**
     * Makes a new Feature.  The `is0Indexed` parameter switches interpretations of the inputs between a 0-indexed open
     * interval or a 1-indexed closed interval.
     * 
     * @param {Object | string} [details] - data of arbitrary shape to attach to this Feature
     * @param {number} start - start base number
     * @param {number} end - end base number
     * @param {boolean} is0Indexed - whether `start` and `end` represent a 0-indexed or 1-indexed interval
     */
    constructor(details, start, end, is0Indexed) {
        // I require this parameter -- no defaults since we want to prevent off-by-1 errors.
        if (is0Indexed === undefined) {
            throw new Error("You must specify whether the input is 0-indexed.");
        }
        this._start = is0Indexed ? start : start - 1;
        this._end = end;
        if (this._end < this._start) {
            throw new Error("End less than start");
        }
        this._details = details;
    }

    /**
     * @return {any} detailed information associated with this Feature
     */
    getDetails() {
        return this._details;
    }

    /**
     * Tries to get a "name" from this Feature's details.  If the details contain no reasonable name, returns an empty
     * string.
     * 
     * @return {string} this Feature's name
     */
    getName() {
        const details = this.getDetails();
        if (details.getName) { // `details` is probably another Feature
            return details.getName();
        } else if (details.name) {
            return details.name;
        } else if (typeof details === "string") {
            return details;
        } else {
            return "";
        }
    }

    /**
     * @return {number} the length of this Feature in bases
     */
    getLength() {
        return this._end - this._start;
    }

    /**
     * @return {Interval} the bounds of this Feature as a 0-indexed open interval
     */
    get0Indexed() {
        return new Interval(this._start, this._end);
    }

    /**
     * @return {Interval} the bounds of this Feature as a 1-indexed closed interval
     */
    get1Indexed() {
        return new Interval(this._start + 1, this._end);
    }

    /**
     * @return {string} a human-readable representation of this Feature as a 0-indexed open interval
     * @override
     */
    toString() {
        return `${this.getName()}:${this._start}-${this._end}`;
    }

    /**
     * Interprets this and another Feature as a multi-Feature interval, with this being the start and the other Feature
     * being the end.  Returns a human-readable representation of the result.
     * 
     * @param {Feature} other - the "end" of the multi-Feature interval
     * @return {string} a human-readable representation of a multi-feature interval
     */
    toStringWithOther(other) {
        return `${this.getName()}:${this._start}-${other.getName()}:${other._end}`;
    }
}

export default Feature;
