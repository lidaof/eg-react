import _ from 'lodash';

/**
 * An object that represents everywhere that a user could potentially navigate and view.  The context is divided into
 * segments; for example, chromosomes.  Thus, there are two ways of representing coordinates:
 * 
 * 1.  "Absolute" coordinates, which are a single base numbers starting from 0.
 * 2.  "Segment" coordinates, which are a segment name and a base number in that segment indexed from 1.
 * 
 * So, in addition to managing segments, this class can parse and convert between these coordinate types.
 * 
 * @author Silas Hsu
 */
class NavigationContext {
    /**
     * Makes a new NavigationContext with specified name and segment list.  Each segment object must contain keys
     * `name` and `lengthInBases`.
     * @param {string} name - name of this context
     * @param {Object[]} segments - list of segments
     */
    constructor(name, segments) {
        this._name = name;

        let totalBases = 0;
        this._segments = _.cloneDeep(segments);
        for (let segment of this._segments) {
            segment.startBase = totalBases;
            totalBases += segment.lengthInBases;
        }
        this._totalBases = totalBases;
    }

    /**
     * @return {string} this navigation context's name, as specified in the constructor
     */
    getName() {
        return this._name;
    }

    /**
     * @return {number} the total number of bases in this context, i.e. how many bases are navigable
     */
    getTotalBases() {
        return this._totalBases;
    }

    /**
     * Given an absolute base number, gets the index of the segment in which the base is located.
     *
     * @param {number} base - the absolute base number to look up
     * @return {number} index of segment
     * @throws {RangeError} if the base is not navigable
     */
    baseToSegmentIndex(base) {
        if (base < 0 || base > this._totalBases) {
            throw new RangeError("Base number not navigable");
        }
        // Last segment (highest base #) to first (lowest base #)
        for (let i = this._segments.length - 1; i > 0; i--) {
            if (base >= this._segments[i].startBase) {
                return i;
            }
        }
        return 0;
    }

    /**
     * Given an absolute base number, gets the segment in which the base is located.  Returns an object with keys `name`
     * and `base`: the segment's name and the base number in that segment as if the segment were *indexed from 1*.
     *
     * @param {number} base - the absolute base number to look up
     * @return {Object} object with keys `name` and `base`
     * @throws {RangeError} if the base is not navigable
     */
    baseToSegmentCoordinate(base) {
        let index = this.baseToSegmentIndex(base); // Can throw RangeError
        let segment = this._segments[index];
        return {
            name: segment.name,
            base: base - segment.startBase + 1, // +1 to index the segment from 1
        }
    }

    /**
     * Given a segment name and base number in that segment, gets the absolute base number in the navigation context.
     * This method assumes that segment base coordinates are *indexed from 1*.
     *
     * @param {string} segmentName - name of the segment to look up
     * @param {number} baseNum - base number in the segment
     * @return {number} the absolute base in this navigation context
     * @throws {RangeError} if the segment or its base number is not in the genome
     */
    segmentCoordinatesToBase(segmentName, baseNum) {
        let segment = this._segments.find(segment => segment.name === segmentName);
        if (!segment) {
            throw new RangeError(`Cannot find segment with name '${segmentName}'`);
        }

        // Take care: `!baseNum` is only appropriate because the `baseNum < 1` check
        if (!baseNum || baseNum < 1 || baseNum > segment.lengthInBases) {
            throw new RangeError(`Base number '${baseNum}' not in segment '${segmentName}'`);
        }
        return segment.startBase + baseNum - 1; // -1 because we assumed segment is 1-indexed.
    }

    /**
     * Parses an interval in this navigation context.  Should be formatted like `$segmentName:$startBase-$endBase` OR
     * `$segmentName:$startBase-$segmentName2:$endBase`.  This format includes UCSC-style chromosomal ranges, like
     * "chr1:1000-chr2:1000".
     * 
     * Returns a object that contains the range's absolute start and end base *as an open interval*.
     *
     * @param {string} string - the string to parse
     * @return {Object} object with props `start` and `end`
     * @throws {RangeError} if parsing fails or if something nonsensical was parsed (like end before start)
     */
    parseRegionString(string) {
        let startSegment, endSegment, startBase, endBase;
        let singleSegmentMatch, multiSegmentMatch;
        // eslint-disable-next-line no-cond-assign
        if ((singleSegmentMatch = string.match(/([\w:]+):(\d+)-(\d+)/)) !== null) {
            startSegment = singleSegmentMatch[1];
            endSegment = startSegment;
            startBase = Number.parseInt(singleSegmentMatch[2], 10);
            endBase = Number.parseInt(singleSegmentMatch[3], 10);
        // eslint-disable-next-line no-cond-assign
        } else if ((multiSegmentMatch = string.match(/([\w:]+):(\d+)-([\w:]+):(\d+)/)) !== null) {
            startSegment = multiSegmentMatch[1];
            endSegment = multiSegmentMatch[3];
            startBase = Number.parseInt(multiSegmentMatch[2], 10);
            endBase = Number.parseInt(multiSegmentMatch[4], 10);
        } else {
            throw new RangeError("Could not parse coordinates");
        }

        let startAbsBase = this.segmentCoordinatesToBase(startSegment, startBase);
        // +1 because open interval: the end is *noninclusive*
        let endAbsBase = this.segmentCoordinatesToBase(endSegment, endBase) + 1; 
        if (endAbsBase < startAbsBase) {
            throw new RangeError("Start of range must be before end of range");
        }

        return {
            start: startAbsBase,
            end: endAbsBase,
        }
    }


}

export default NavigationContext;
