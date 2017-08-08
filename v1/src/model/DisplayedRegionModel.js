const MIN_ABS_BASE = 0; // Index absolute bases starting from this number.  Take caution in modifying this!

/**
 * Model that stores the currently displayed genomic region.  Internally, expresses the current region as a single open
 * interval [startBaseNumber, endBaseNumber).  For APIs that require 1-indexing and chromosomal ranges (such as
 * "chr1:1-1000", the first 1000 bases of chromosome 1), this class also provides such funtionality.
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
        this._chromosomes = chromosomes.slice();
        for (let chromosome of this._chromosomes) {
            chromosome.startBase = totalBases;
            totalBases += chromosome.lengthInBases;
        }
        this._genomeLength = totalBases;

        this.setRegion(MIN_ABS_BASE, MIN_ABS_BASE);
    }

    /**
     * @return {Object[]} copy of the internal list of chromosomes
     */
    getChromosomeList() {
        return this._chromosomes.slice();
    }

    /**
     * Given an absolute base number, gets the index of the chromosome in which the base is located.
     *
     * @param {number} base - the absolute base number to look up
     * @return {number} index of chromosome
     */
    baseToChromosomeIndex(base) {
        // Last chromosome (highest base #) to first (lowest base #)
        for (let i = this._chromosomes.length - 1; i > 0; i--) {
            if (base >= this._chromosomes[i].startBase) {
                return i;
            }
        }
        return 0;
    }

    /**
     * @return {number} the current width of the region, in base pairs
     */
    getWidth() {
        return this._endBase - this._startBase;
    }

    /**
     * Gets a copy of the internally stored 0-indexed open interval that represents this displayed region.
     *
     * @return {Object} object with props `start` and `end`
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
        let leftChrIndex = this.baseToChromosomeIndex(this._startBase);
        let rightChrIndex = this.baseToChromosomeIndex(this._endBase);
        let leftChr = this._chromosomes[leftChrIndex];
        let rightChr = this._chromosomes[rightChrIndex];
        // SingleChromosomeIntervals are 1-indexed so we add 1
        let leftChrStart = this._startBase - leftChr.startBase + 1;
        let rightChrEnd = this._endBase - rightChr.startBase + 1;

        if (leftChrIndex === rightChrIndex) {
            return [new SingleChromosomeInterval(leftChr.name, leftChrStart, rightChrEnd)];
        }

        let result = [];

        result.push(new SingleChromosomeInterval(leftChr.name, leftChrStart, leftChr.lengthInBases));
        for (let i = leftChrIndex + 1; i < rightChrIndex; i++) {
            let chr = this._chromosomes[i];
            result.push(new SingleChromosomeInterval(chr.name, 1, chr.lengthInBases));
        }
        result.push(new SingleChromosomeInterval(rightChr.name, 1, rightChrEnd));

        return result;
    }

    /**
     * Safely sets the internal display interval, ensuring that it stays within the genome and makes sense. `start` and
     * `end` should express a 0-indexed open interval of base numbers, [startBaseNumber, endBaseNumber).
     *
     * @param {number} start - the (inclusive) start of the region interval as a base pair number
     * @param {number} end - the (exclusive) end of the region interval as a base pair number
     * @param {boolean} [preserveLength] - option to preserve the input length as much as possible.  Default: false
     * @throws {RangeError} if end is less than start
     */
    setRegion(start, end, preserveLength) {
        if (end < start) {
            throw new RangeError("Start must be less than or equal to end");
        }
        if (preserveLength) {
            let newLength = end - start;
            if (start < MIN_ABS_BASE) { // Left cut off; we need to extend right side
                end = MIN_ABS_BASE + newLength;
            } else if (end > this._genomeLength) { // Ditto for right
                start = this._genomeLength - newLength;
            }
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
        this.setRegion(this._startBase + numBases, this._endBase + numBases, true);
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
    zoom(factor, focalPoint) {
        if (factor <= 0) {
            throw new RangeError("Zoom factor must be greater than 0");
        }
        if (focalPoint === undefined || focalPoint === null) {
            focalPoint = 0.5;
        }

        let newWidth = this.getWidth() * factor;
        let absFocalPoint = this.getWidth() * focalPoint + this._startBase;
        let newAbsFocalPoint = newWidth * focalPoint + this._startBase;
        let panAmount = absFocalPoint - newAbsFocalPoint;

        // Raw start and end: not rounded or checked to be within the genome
        let rawStart = this._startBase + panAmount;
        let rawEnd = this._startBase + newWidth + panAmount;

        this.setRegion(rawStart, rawEnd, true);
    }
}

/**
 * Simple container class representing an interval within a single chromosome.  Stores intervals as a closed interval of
 * base pair numbers.
 */
class SingleChromosomeInterval {

    /**
     * Makes a new SingleChromosomeInterval.
     *
     * @param {string} chromosomeName - the name of the chromosome
     * @param {number} start - the (inclusive) start of the interval as a base pair number
     * @param {number} end - the (inclusive) end of the interval as a base pair number
     */
    constructor(chromosomeName, start, end) {
        this.chromosomeName = chromosomeName;
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
        return `${this.chromosomeName}:${this.start}:${this.end}`;
    }
}

export default DisplayedRegionModel;
