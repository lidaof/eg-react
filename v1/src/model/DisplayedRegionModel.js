import _ from 'lodash';

const MIN_ABS_BASE = 0; // Index absolute bases starting from this number.  Take caution in modifying this!

/**
 * Model that stores the currently displayed genomic region.  Internally, expresses the current region as a single open
 * interval [startBaseNumber, endBaseNumber).  Also provides helpers to convert to and from UCSC notation, e.g. 
 * "chr1:1-1000", the first 1000 bases of chromosome 1.
 *
 * @author Silas Hsu
 */
class DisplayedRegionModel {
    /**
     * Makes a new DisplayedRegionModel with specified genome name and chromosome list.  The list should be in order,
     * and each chromosome should contain its length in bases.
     *
     * @param {string} name - name of this genome
     * @param {Object[]} chromosomes - list of chromosomes in this genome
     */
    constructor(name, chromosomes) {
        this.name = name;

        let totalBases = 0;
        this._chromosomes = _.cloneDeep(chromosomes);
        for (let chromosome of this._chromosomes) {
            chromosome.startBase = totalBases;
            totalBases += chromosome.lengthInBases;
        }
        this._genomeLength = totalBases;

        this.setRegion(MIN_ABS_BASE, MIN_ABS_BASE);
    }

    /**
     * Given an absolute base number, gets the index of the chromosome in which the base is located.
     *
     * @param {number} base - the absolute base number to look up
     * @return {number} index of chromosome
     * @throws {RangeError} if the base is not in the genome
     */
    baseToChromosomeIndex(base) {
        if (base < 0 || base > this._genomeLength) {
            throw new RangeError("Base number not in genome");
        }
        // Last chromosome (highest base #) to first (lowest base #)
        for (let i = this._chromosomes.length - 1; i > 0; i--) {
            if (base >= this._chromosomes[i].startBase) {
                return i;
            }
        }
        return 0;
    }

    /**
     * Given an absolute base number, gets the chromosome's name and base number.
     *
     * @param {number} base - the absolute base number to look up
     * @return {Object} object with keys `name` and `base`
     * @throws {RangeError} if the base is not in the genome
     */
    baseToChromosomeCoordinate(base) {
        let index = this.baseToChromosomeIndex(base); // Can throw RangeError
        let chr = this._chromosomes[index];
        return {
            name: chr.name,
            base: base - chr.startBase + 1,
        }
    }

    /**
     * Given a chromosome name and base number in that chromosome, gets the absolute base number in this genome.
     *
     * @param {string} chrName - name of the chromosome to look up
     * @param {number} baseNum - base number in the chromosome
     * @return {number} the absolute base in this genome
     * @throws {RangeError} if the chromosome or its base number is not in the genome
     */
    chromosomeCoordinatesToBase(chrName, baseNum) {
        let chr = this._chromosomes.find(chr => chr.name === chrName);
        if (!chr) {
            throw new RangeError(`Cannot find chromosome with name '${chrName}'`);
        }

        // Take care: `!baseNum` is only appropriate because the `baseNum < 1` check
        if (!baseNum || baseNum < 1 || baseNum > chr.lengthInBases) {
            throw new RangeError(`Base number '${baseNum}' not in chromosome '${chrName}'`);
        }
        return chr.startBase + baseNum - 1;
    }

    /**
     * Parses a UCSC-style chromosomal range, like "chr1:1000-chr2:1000", and returns a object that contains the range's
     * absolute start and end base.
     *
     * @param {string} string - the string to parse
     * @return {Object} object with props `start` and `end`
     * @throws {RangeError} if parsing fails or if something nonsensical was parsed (like end before start)
     */
    parseRegionString(string) {
        let startChr, endChr, startBase, endBase;
        let singleChrMatch, multiChrMatch;
        // eslint-disable-next-line no-cond-assign
        if ((singleChrMatch = string.match(/([\w:]+):(\d+)-(\d+)/)) !== null) {
            startChr = singleChrMatch[1];
            endChr = startChr;
            startBase = Number.parseInt(singleChrMatch[2], 10);
            endBase = Number.parseInt(singleChrMatch[3], 10);
        // eslint-disable-next-line no-cond-assign
        } else if ((multiChrMatch = string.match(/([\w:]+):(\d+)-([\w:]+):(\d+)/)) !== null) {
            startChr = multiChrMatch[1];
            endChr = multiChrMatch[3];
            startBase = Number.parseInt(multiChrMatch[2], 10);
            endBase = Number.parseInt(multiChrMatch[4], 10);
        } else {
            throw new RangeError("Could not parse coordinates");
        }

        let startAbsBase = this.chromosomeCoordinatesToBase(startChr, startBase);
        let endAbsBase = this.chromosomeCoordinatesToBase(endChr, endBase) + 1;
        if (endAbsBase < startAbsBase) {
            throw new RangeError("Start of range must be before end of range");
        }

        return {
            start: startAbsBase,
            end: endAbsBase,
        }
    }

    /**
     * @return {number} length of the genome in base pairs
     */
    getGenomeLength() {
        return this._genomeLength;
    }

    /**
     * @return {number} the current width of the region, in base pairs
     */
    getWidth() {
        return this._endBase - this._startBase;
    }

    /**
     * @typedef {Object} DisplayedRegionModel~Region
     * @property {number} start - the start of the region, inclusive
     * @property {number} end - the start of the region, exclusive
     */

    /**
     * Gets a copy of the internally stored 0-indexed open interval that represents this displayed region.
     *
     * @return {DisplayedRegionModel~Region} copy of the internally stored region
     */
    getAbsoluteRegion() {
        return {
            start: this._startBase,
            end: this._endBase
        }
    }

    /**
     * Gets the current region expressed as a list of single-chromosome intervals.
     *
     * @return {SingleChromosomeInterval[]} a list of SingleChromosomeInterval
     */
    getRegionList() {
        let inRegion = this._chromosomes.filter((chr) => {
            return (chr.startBase + chr.lengthInBases > this._startBase) && (chr.startBase < this._endBase);
        });

        let leftChr = inRegion[0];
        let rightChr = inRegion[inRegion.length - 1];
        // SingleChromosomeIntervals are 1-indexed so we add 1
        let leftChrStart = this._startBase - leftChr.startBase + 1;
        let rightChrEnd = this._endBase - rightChr.startBase;

        if (inRegion.length === 1) {
            return [new SingleChromosomeInterval(leftChr.name, leftChrStart, rightChrEnd, leftChr)];
        }

        let result = [];
        result.push(new SingleChromosomeInterval(leftChr.name, leftChrStart, leftChr.lengthInBases, leftChr));
        for (let i = 1; i < inRegion.length - 1; i++) {
            let chr = inRegion[i];
            result.push(new SingleChromosomeInterval(chr.name, 1, chr.lengthInBases, chr));
        }
        result.push(new SingleChromosomeInterval(rightChr.name, 1, rightChrEnd, rightChr));

        return result;
    }

    /**
     * Safely sets the internal display interval, ensuring that it stays within the genome and makes sense. `start` and
     * `end` should express a 0-indexed open interval of base numbers, [startBaseNumber, endBaseNumber).  This
     * function will attempt to preserve the input length as much as possible.
     *
     * @param {number} start - the (inclusive) start of the region interval as a base pair number
     * @param {number} end - the (exclusive) end of the region interval as a base pair number
     * @throws {RangeError} if end is less than start, or the inputs are undefined/infinite
     */
    setRegion(start, end) {
        if (!Number.isFinite(start) || !Number.isFinite(end)) {
            throw new RangeError("Start and end must be well-defined");
        }
        if (end < start) {
            throw new RangeError("Start must be less than or equal to end");
        }

        let newLength = end - start;
        if (start < MIN_ABS_BASE) { // Left cut off; we need to extend right side
            end = MIN_ABS_BASE + newLength;
        } else if (end > this._genomeLength) { // Ditto for right
            start = this._genomeLength - newLength;
        }

        this._startBase = Math.round(Math.max(MIN_ABS_BASE, start));
        this._endBase = Math.round(Math.min(end, this._genomeLength));
    }

    /**
     * Pans the current region by a constant number of bases, also ensuring view boundaries stay within the genome.
     * Negative numbers pull regions on the left into view (=pan right); positive numbers pull regions on the right into
     * view (=pan left).
     *
     * @param {number} numBases - number of base pairs to pan
     */
    pan(numBases) {
        this.setRegion(this._startBase + numBases, this._endBase + numBases);
    }

    /**
     * Multiplies the size of the current region by a factor, also ensuring view boundaries stay within the genome.
     * Factors less than 1 zoom in (region gets shorter); factors greater than 1 zoom out (region gets longer).
     * Additionally, one can specify the focal point of the zoom as the number of region widths from the left edge.  By
     * default this is 0.5, which is the center of the region.
     *
     * Note that due to rounding, zoom() is approximate; a zoom(2) followed by a zoom(0.5) may still change the region
     * boundaries by a base or two.
     *
     * @param {number} factor - number by which to multiply this region's width
     * @param {number} [focalPoint] - (optional) measured as number of region widths from the left edge.  Default: 0.5
     */
    zoom(factor, focalPoint=0.5) {
        if (factor <= 0) {
            throw new RangeError("Zoom factor must be greater than 0");
        }

        let newWidth = this.getWidth() * factor;
        let absFocalPoint = this.getWidth() * focalPoint + this._startBase;
        let newAbsFocalPoint = newWidth * focalPoint + this._startBase;
        let panAmount = absFocalPoint - newAbsFocalPoint;

        // Raw start and end: not rounded or checked to be within the genome
        let rawStart = this._startBase + panAmount;
        let rawEnd = this._startBase + newWidth + panAmount;

        this.setRegion(rawStart, rawEnd);
    }
}

/**
 * Simple container class representing an interval within a single chromosome.  Stores intervals as a closed interval of
 * base pair numbers.
 */
class SingleChromosomeInterval {

    /**
     * Makes a new SingleChromosomeInterval.  Makes a *shallow* copy of all the parameters.
     *
     * @param {string} name - the name of the chromosome
     * @param {number} start - the (inclusive) start of the interval as a base pair number
     * @param {number} end - the (inclusive) end of the interval as a base pair number
     * @param {Object} metadata - additional info about this chromosome
     */
    constructor(name, start, end, metadata) {
        this.name = name;
        this.start = start;
        this.end = end;
        this.metadata = metadata;
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

export default DisplayedRegionModel;
