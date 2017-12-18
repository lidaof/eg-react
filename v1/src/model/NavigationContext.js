import _ from 'lodash';
import SegmentInterval from './SegmentInterval';

/**
 * An object that represents everywhere that a user could potentially navigate and view.  The context is divided into
 * segments; for example, chromosomes.  Thus, there are two ways of representing coordinates:
 * 
 * 1.  "Absolute" coordinates, which are a single base numbers starting from 0.
 * 2.  "Segment" coordinates, which are a segment name and a base number in that segment indexed from 1.
 * 
 * Segments are indexed from 1 since many APIs takes coordinates in this way.  In any case, this class can parse and
 * convert between these coordinate types.
 * 
 * @author Silas Hsu
 */
class NavigationContext {
    /**
     * Makes a new NavigationContext.  Each segment object in `segments` must contain keys `name` and `lengthInBases`.
     * `GenomeCoordinateMap` is optional; if provided, it will be used to map the segments to actual genomic
     * coordinates.
     * 
     * @param {string} name - name of this context
     * @param {Object[]} segments - list of segments
     * @param {GenomeCoordinateMap} - object that maps segments to actual genomic coordinates
     */
    constructor(name, segments, genomeCoordinateMap) {
        this._name = name;
        this._segments = _.cloneDeep(segments);
        this._genomeCoordinateMap = genomeCoordinateMap;
        
        let totalBases = 0;
        for (let segment of this._segments) {
            if (!segment.name || !segment.lengthInBases) {
                throw new Error("All segments must contain props `name` and `lengthInBases` greater than 0");
            }
            if (segment.startBase) {
                console.warn("Replacing startBase property in a segment");
            }
            segment.startBase = totalBases;
            totalBases += segment.lengthInBases || 0;
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
     * Gets the internal segment list for this object.  Warning: modifying this will modify the context.
     * 
     * @return {Object[]} the internal segment list for this object
     */
    getSegments() {
        return this._segments;
    }

    /**
     * @return {number} the total number of bases in this context, i.e. how many bases are navigable
     */
    getTotalBases() {
        return this._totalBases;
    }

    /**
     * Given an absolute base number, gets whether the base is navigable.
     * 
     * @param {number} base - absolute base number
     * @return {boolean} whether the base is navigable
     */
    getIsValidBase(base) {
        return base >= 0 && base < this._totalBases;
    }

    /**
     * Given an absolute base number, gets the index of the segment in which the base is located.
     *
     * @param {number} base - the absolute base number to look up
     * @return {number} index of segment
     * @throws {RangeError} if the base is invalid
     */
    convertBaseToSegmentIndex(base) {
        if (!this.getIsValidBase(base)) {
            throw new RangeError("Invalid base number");
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
     * @throws {RangeError} if the base is invalid
     */
    convertBaseToSegmentCoordinate(base) {
        let index = this.convertBaseToSegmentIndex(base); // Can throw RangeError
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
    convertSegmentCoordinateToBase(segmentName, baseNum) {
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
     * Returns a object that contains the range's absolute start and end base *as an open interval*.  Throws RangeError
     * on parse failure.
     *
     * @param {string} string - the string to parse
     * @return {Object} object with props `start` and `end`
     * @throws {RangeError} when parsing an interval outside of the context or something otherwise nonsensical
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

        let startAbsBase = this.convertSegmentCoordinateToBase(startSegment, startBase);
        // +1 because open interval: the end is *noninclusive*
        let endAbsBase = this.convertSegmentCoordinateToBase(endSegment, endBase) + 1; 
        if (endAbsBase < startAbsBase) {
            throw new RangeError("Start of range must be before end of range");
        }

        return {
            start: startAbsBase,
            end: endAbsBase,
        }
    }

    /**
     * Gets the segments that overlap an interval, as a list of SegmentInterval.  The interval should be expressed as an
     * open interval of absolute base numbers.
     * 
     * @param {number} absStart - (inclusive) start of interval, as an absolute base number
     * @param {number} absEnd - (exclusive) end of interval, as an absolute base number
     * @return {SegmentInterval[]} list of SegmentInterval
     */
    getSegmentsInInterval(absStart, absEnd) {
        const overlappingSegments = this._segments.filter((segment) => {
            return (segment.startBase + segment.lengthInBases > absStart) && (segment.startBase < absEnd);
        });

        const leftSegment = overlappingSegments[0];
        const rightSegment = overlappingSegments[overlappingSegments.length - 1];
        const leftSegmentStart = absStart - leftSegment.startBase + 1; // +1 to convert from 0-indexing to 1-indexing
        const rightSegmentEnd = absEnd - rightSegment.startBase; // No +1 needed since we are making a closed interval

        if (overlappingSegments.length === 1) {
            return [new SegmentInterval(leftSegment, leftSegmentStart, rightSegmentEnd)];
        }

        let result = [];
        result.push(new SegmentInterval(leftSegment, leftSegmentStart, leftSegment.lengthInBases));
        for (let i = 1; i < overlappingSegments.length - 1; i++) {
            let segment = overlappingSegments[i];
            result.push(new SegmentInterval(segment, 1, segment.lengthInBases));
        }
        result.push(new SegmentInterval(rightSegment, 1, rightSegmentEnd));

        return result;
    }

    /**
     * Gets the segments that overlap an absolute interval, maps it to genomic coordinates, and returns the result in a
     * list of SegmentInterval.  The interval should be expressed as an open interval of absolute base numbers.
     * 
     * The mapping is done with the GenomeCoordinateMap provided when this object was constructed.  If none was
     * provided, the result is identical to {@link getSegmentsInInterval}.  If there are segments not in the lookup
     * object, those segments are ignored.
     * 
     * @param {number} absStart - (inclusive) start of interval, as an absolute base number
     * @param {number} absEnd - (exclusive) end of interval, as an absolute base number
     * @return {SegmentInterval[]} list of SegmentInterval
     */
    mapAbsIntervalToGenome(absStart, absEnd) {
        const segments = this.getSegmentsInInterval(absStart, absEnd);
        let results = segments;
        if (this._genomeCoordinateMap) {
            results = [];

            for (let segment of segments) {
                let lookupResult = this._genomeCoordinateMap.getGenomeInterval(segment);
                if (lookupResult) {
                    results.push(lookupResult);
                }
            }
        }

        return results;
    }

    /**
     * TODO
     * @param {*} singleChromosomeInterval 
     */
    mapFromGenomeInterval(singleChromosomeInterval) {
        let intervalInThisContext = singleChromosomeInterval;
        if (this._genomeCoordinateMap) {
            intervalInThisContext = this._genomeCoordinateMap.getSegmentInterval(singleChromosomeInterval);
        }

        if (intervalInThisContext) {
            return {
                start: this.convertSegmentCoordinateToBase(intervalInThisContext.name, intervalInThisContext.start),
                end: this.convertSegmentCoordinateToBase(intervalInThisContext.name, intervalInThisContext.end),
            };
        } else {
            return null;
        }
    }

}

export default NavigationContext;
