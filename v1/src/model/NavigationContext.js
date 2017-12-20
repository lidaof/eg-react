import Feature from './Feature';
import Interval from './Interval';

/**
 * An object that represents everywhere that a user could potentially navigate and view.  The context is divided into
 * segments/features; for example, chromosomes.  Thus, there are two ways of representing coordinates:
 * 
 * 1.  "Absolute" coordinates, which are a single base numbers starting from 0.
 * 2.  "Segment" coordinates, which are a segment and base number relative to the start of the segment.
 * 
 * In the case of segment coordinates or intervals, methods return Feature objects.  The `details` prop shall contain
 * a segment (Feature) which was provided on object construction, and getting the Feature's interval shall provide base
 * numbers relative to the start of that segment.  See {@link Feature} for more info.
 * 
 * @author Silas Hsu
 */
class NavigationContext {
    /**
     * Makes a new NavigationContext.  The only the lengths of the input segments are important.  The
     * `GenomeCoordinateMap` is optional; if provided, it shall map the input segments to actual genomic
     * coordinates.
     * 
     * @param {string} name - name of this context
     * @param {Feature[]} segments - list of segments
     * @param {GenomeCoordinateMap} - object that maps segments to actual genomic coordinates
     */
    constructor(name, segments, genomeCoordinateMap) {
        this._name = name;
        this._segments = segments;
        this._segmentStarts = [];
        this._segmentNameToIndex = {};
        this._genomeCoordinateMap = genomeCoordinateMap;

        let totalBases = 0;
        let i = 0;
        for (let segment of segments) {
            // Make sure names are unique
            const name = segment.getName();
            if (this._segmentNameToIndex[name] !== undefined) {
                throw new Error(`Duplicate name ${name} detected; segments must have unique names.`);
            }
            this._segmentNameToIndex[name] = i;

            // Add to segment list w/ additional details
            this._segmentStarts.push(totalBases);
            totalBases += segment.getLength();
            i++;
        }
        this._totalBases = totalBases;
        if (this._totalBases === 0) {
            throw new Error("Context has 0 length");
        }
    }

    /**
     * @return {string} this navigation context's name, as specified in the constructor
     */
    getName() {
        return this._name;
    }

    /**
     * Gets the internal segment list for this object.  This list should be treated as read-only; modifying its elements
     * may cause undefined behavior.
     * 
     * @return {Feature[]} the internal segment list for this object
     */
    getSegments() {
        return this._segments.slice();
    }

    /**
     * Gets the absolute coordinate of a segment's start.  Throws an error if the segment cannot be found.
     * 
     * @param {string} name - the segment's name
     * @return {number} the absolute coordinate of the segment's start
     * @throws {RangeError} if the segment's name is not in this context
     */
    getSegmentStart(name) {
        const index = this._segmentNameToIndex[name];
        if (index === undefined) {
            throw new RangeError(`Cannot find segment with name '${name}'`);
        }
        return this._segmentStarts[index];
    }

    /**
     * @return {number} the total number of bases in this context, i.e. how many bases are navigable
     */
    getTotalBases() {
        return this._totalBases;
    }

    /**
     * Given an absolute coordinate, gets whether the base is navigable.
     * 
     * @param {number} base - absolute coordinate
     * @return {boolean} whether the base is navigable
     */
    getIsValidBase(base) {
        return base >= 0 && base < this._totalBases;
    }

    /**
     * Given an absolute coordinate, gets the index of the segment in which the base is located.
     *
     * @param {number} base - the absolute coordinate to look up
     * @return {number} index of segment
     * @throws {RangeError} if the base is invalid
     */
    convertBaseToSegmentIndex(base) {
        if (!this.getIsValidBase(base)) {
            throw new RangeError("Invalid base number");
        }
        // Last segment (highest base #) to first (lowest base #)
        for (let i = this._segmentStarts.length - 1; i > 0; i--) {
            if (base >= this._segmentStarts[i]) {
                return i;
            }
        }
        return 0;
    }

    /**
     * Given an absolute coordinate, gets the segment where it is located.  Returns a segment coordinate (see the class
     * docstring for more info on segment coordinates).
     *
     * @param {number} base - the absolute coordinate to look up
     * @return {Feature} corresponding segment coordinate
     * @throws {RangeError} if the base is invalid
     */
    convertBaseToSegmentCoordinate(base) {
        const index = this.convertBaseToSegmentIndex(base); // Can throw RangeError
        const segment = this._segments[index];
        const coordinate = base - this._segmentStarts[index];
        return new Feature(segment, coordinate, coordinate + 1, true); // An interval one base long
    }

    /**
     * Given a segment name and base number relative to the segment's start, finds the absolute coordinate in this
     * navigation context.  Be sure to specify if the base is 0- or 1-indexed!
     *
     * @param {string} segmentName - name of the segment to look up
     * @param {number} baseNum - base number relative to segment's start
     * @param {boolean} isBase0Indexed - whether `baseNum` is 0-indexed
     * @return {number} the absolute base in this navigation context
     * @throws {RangeError} if the segment name or its base number is not in this context
     */
    convertSegmentCoordinateToBase(queryName, base, isBase0Indexed) {
        if (isBase0Indexed === undefined) {
            throw new Error("You must specify whether the input base is 0-indexed");
        }
        if (!isBase0Indexed) { // Convert to 0-indexing.
            base -= 1;
        }

        const index = this._segmentNameToIndex[queryName];
        if (index === undefined) {
            throw new RangeError(`Cannot find segment with name '${queryName}'`);
        }
        const segment = this._segments[index];
        const absStart = this._segmentStarts[index];

        if (0 <= base && base <= segment.getLength()) {
            return absStart + base;
        } else {
            throw new RangeError(`Base number '${base}' not in segment '${queryName}'`);
        }
    }

    /**
     * Parses an interval in this navigation context.  Should be formatted like "$segmentName:$startBase-$endBase" OR
     * "$segmentName:$startBase-$segmentName2:$endBase".  This format corresponds to UCSC-style chromosomal ranges, like
     * "chr1:1000-chr2:1000", **except that we expect 0-indexed intervals**.
     * 
     * Returns an open interval of absolute coordinates.  Throws RangeError on parse failure.
     *
     * @param {string} string - the string to parse
     * @return {Interval} the parsed absolute interval
     * @throws {RangeError} when parsing an interval outside of the context or something otherwise nonsensical
     */
    parseRegionString(string) {
        let startName, endName, startBase, endBase;
        let singleSegmentMatch, multiSegmentMatch;
        // eslint-disable-next-line no-cond-assign
        if ((singleSegmentMatch = string.match(/([\w:]+):(\d+)-(\d+)/)) !== null) {
            startName = singleSegmentMatch[1];
            endName = startName;
            startBase = Number.parseInt(singleSegmentMatch[2], 10);
            endBase = Number.parseInt(singleSegmentMatch[3], 10);
        // eslint-disable-next-line no-cond-assign
        } else if ((multiSegmentMatch = string.match(/([\w:]+):(\d+)-([\w:]+):(\d+)/)) !== null) {
            startName = multiSegmentMatch[1];
            endName = multiSegmentMatch[3];
            startBase = Number.parseInt(multiSegmentMatch[2], 10);
            endBase = Number.parseInt(multiSegmentMatch[4], 10);
        } else {
            throw new RangeError("Could not parse coordinates");
        }

        let startAbsBase = this.convertSegmentCoordinateToBase(startName, startBase, true);
        let endAbsBase = this.convertSegmentCoordinateToBase(endName, endBase, true);
        if (startAbsBase < endAbsBase) {
            return new Interval(startAbsBase, endAbsBase);
        } else {
            throw new RangeError("Start of range must be before end of range");
        }
    }

    /**
     * Queries segments that overlap an open interval of absolute coordinates.  Returns a list of segment intervals (see
     * the class docstring for more info on segment intervals).
     * 
     * @param {number} queryStart - (inclusive) start of interval, as an absolute coordinate
     * @param {number} queryEnd - (exclusive) end of interval, as an absolute coordinate
     * @return {Feature[]} list of segment intervals
     */
    getSegmentsInInterval(queryStart, queryEnd) {
        const overlappingSegments = []; // Construct overlapping segment list; it will be sorted left to right.
        const overlappingSegmentStarts = [];
        for (let i = 0; i < this._segments.length; i++) {
            const segment = this._segments[i];
            const segmentStart = this._segmentStarts[i];
            const segmentEnd = segmentStart + segment.getLength(); // Noninclusive
            /*
             * You can convince yourself this is correct by considering three cases:
             *  - the query overlaps the segment on the left side
             *  - the query is entirely inside the segment
             *  - the query overlaps the segment on the right side
             */
            if (queryStart < segmentEnd && segmentStart < queryEnd) { 
                overlappingSegments.push(segment);
                overlappingSegmentStarts.push(segmentStart);
            }
        }

        const leftSegment = overlappingSegments[0];
        const rightSegment = overlappingSegments[overlappingSegments.length - 1];
        const leftSegmentStart = queryStart - overlappingSegmentStarts[0];
        const rightSegmentEnd = queryEnd - overlappingSegmentStarts[overlappingSegments.length - 1];

        if (overlappingSegments.length === 1) {
            return [new Feature(leftSegment, leftSegmentStart, rightSegmentEnd, true)];
        }

        let result = [];
        result.push(new Feature(leftSegment, leftSegmentStart, leftSegment.getLength(), true));
        for (let i = 1; i < overlappingSegments.length - 1; i++) {
            let segment = overlappingSegments[i];
            result.push(new Feature(segment, 0, segment.getLength(), true));
        }
        result.push(new Feature(rightSegment, 0, rightSegmentEnd, true));

        return result;
    }

    /**
     * Queries segments that overlap an open interval of absolute coordinates, and maps them to a list of genomic
     * (chromosome) intervals, which behave similar to segment intervals.
     * 
     * The mapping is done with the GenomeCoordinateMap provided when this object was constructed.  Failed lookups are
     * ignored.  If no mapping was provided, the result is identical to {@link getSegmentsInInterval}.  
     * 
     * @param {number} absStart - (inclusive) start of interval, as an absolute coordinate
     * @param {number} absEnd - (exclusive) end of interval, as an absolute coordinate
     * @return {Feature[]} list of chromosome intervals
     */
    mapAbsIntervalToGenome(absStart, absEnd) {
        const segments = this.getSegmentsInInterval(absStart, absEnd);
        if (this._genomeCoordinateMap) {
            let results = [];
            for (let segment of segments) {
                let lookupResult = this._genomeCoordinateMap.mapToGenome(segment);
                if (lookupResult) {
                    results.push(lookupResult);
                }
            }
            return results;
        } else {
            return segments;
        }
    }

    /**
     * Given a chromosome interval (see class docstring on segment intervals), maps it to an open interval of 
     * absolute coordinates in this context.
     * 
     * The mapping is done with the GenomeCoordinateMap provided when this object was constructed.  A failed lookup
     * results in null.  If no mapping was provided, the result is identical to `convertSegmentCoordinateToBase`, called
     * on the input interval's start and end.
     * 
     * @param {Feature} genomicInterval - chromosomal interval
     * @return {(Interval | null)} open interval of absolute coordinates in this context, or null if not found.
     */
    mapFromGenomeInterval(genomicInterval) {
        const interval = this._genomeCoordinateMap ?
            this._genomeCoordinateMap.mapFromGenome(genomicInterval) : genomicInterval;

        if (interval) {
            const name = interval.getName();
            const [start, end] = interval.get0Indexed();
            return new Interval(
                this.convertSegmentCoordinateToBase(name, start, true),
                this.convertSegmentCoordinateToBase(name, end, true)
            );
        } else {
            return null;
        }
    }

}

export default NavigationContext;
