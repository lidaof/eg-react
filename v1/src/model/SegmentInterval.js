/**
 * Simple container class representing an interval within a a segment.  Stores intervals as a closed interval of base
 * numbers indexed from 1.
 */
class SegmentInterval {
    /**
     * Makes a new SegmentInterval.  Makes a *shallow* copy of all the parameters.  The first parameter should contain
     * the segment's name.  If it is a string, it is treated as the name, and if it is an object, the object's `name`
     * property will become the segment's name.
     *
     * @param {(Object | string)} segment - the segment in which the interval resides.  Can be a string or object.
     * @param {number} start - the (inclusive) start of the interval as a base pair number
     * @param {number} end - the (inclusive) end of the interval as a base pair number
     */
    constructor(segment, start, end) {
        this.segment = segment;
        this.name = typeof segment === "string" ? segment : segment.name;
        this.start = start;
        this.end = end;
    }

    /**
     * Gets this interval represented in UCSC notation, e.g. "chr1:1-1000", the first 1000 bases of chromosome 1.
     *
     * @override
     * @return {string} this interval represented in UCSC notation
     */
    toString() {
        return `${this.name}:${this.start}-${this.end}`;
    }
}

export default SegmentInterval;
