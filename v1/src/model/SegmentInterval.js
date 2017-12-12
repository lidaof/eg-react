/**
 * Simple container class representing an interval within a a segment.  Stores intervals as a closed interval of base
 * numbers indexed from 1.
 */
class SegmentInterval {
    /**
     * Makes a new SegmentInterval.  Makes a *shallow* copy of all the parameters.
     *
     * @param {Object} segment - the segment in which the interval resides
     * @param {number} start - the (inclusive) start of the interval as a base pair number
     * @param {number} end - the (inclusive) end of the interval as a base pair number
     */
    constructor(segment, start, end) {
        this.segment = segment;
        this.name = segment.name;
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
