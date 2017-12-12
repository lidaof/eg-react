const MIN_ABS_BASE = 0; // Index absolute bases from this number.  Take caution in modifying this!

/**
 * Model that stores the view window/region in a larger navigation context (e.g. a genome).  Internally stores the
 * region as an open interval of absolute base numbers (@see {@link NavigationContext}).
 *
 * @author Silas Hsu
 */
class DisplayedRegionModel {
    /**
     * Makes a new DisplayedRegionModel with specified navigation context, and optionally, initial view region.
     *
     * @param {NavigationContext} navContext - the context in which navigation will take place
     * @param {number} start - initial start of the view region
     * @param {number} end - initial end of the view region
     */
    constructor(navContext, start=MIN_ABS_BASE, end=MIN_ABS_BASE) {
        this._navContext = navContext;
        this.setRegion(start, end); // Sets this._startBase and this._endBase
    }

    /**
     * Makes copy of this object such that no methods on the copy will modify the original.
     * 
     * @return {DisplayedRegionModel} a copy of this object
     */
    clone() {
        return new DisplayedRegionModel(this._navContext, this._startBase, this._endBase);
    }

    /**
     * @return {NavigationContext} the navigation context with which this object was created
     */
    getNavigationContext() {
        return this._navContext;
    }

    /**
     * @return {number} the current width of the view, in base pairs
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
        if (this.genomeCoordinateLookup) {

        }

        let inRegion = this._navContext._segments.filter((chr) => {
            return (chr.startBase + chr.lengthInBases > this._startBase) && (chr.startBase < this._endBase);
        });

        let leftChr = inRegion[0];
        let rightChr = inRegion[inRegion.length - 1];
        // SingleChromosomeIntervals are 1-indexed so we add 1
        let leftChrStart = this._startBase - leftChr.startBase + 1;
        let rightChrEnd = this._endBase - rightChr.startBase;

        if (inRegion.length === 1) {
            return [this._makeChromosomeInterval(leftChr, leftChrStart, rightChrEnd)];
        }

        let result = [];
        result.push(this._makeChromosomeInterval(leftChr, leftChrStart, leftChr.lengthInBases));
        for (let i = 1; i < inRegion.length - 1; i++) {
            let chr = inRegion[i];
            result.push(this._makeChromosomeInterval(chr, 1, chr.lengthInBases));
        }
        result.push(this._makeChromosomeInterval(rightChr, 1, rightChrEnd));

        return result;
    }

    _makeChromosomeInterval(region, relativeStart, relativeEnd) {
        if (this.genomeCoordinateLookup) {
            return this.genomeCoordinateLookup.getGenomicCoordinate(region, relativeStart, relativeEnd);
        } else {
            return new SingleChromosomeInterval(region.name, relativeStart, relativeEnd, region);
        }
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
        let navigableLength = this._navContext.getTotalBases();
        if (start < MIN_ABS_BASE) { // Left cut off; we need to extend right side
            end = MIN_ABS_BASE + newLength;
        } else if (end > navigableLength) { // Ditto for right
            start = navigableLength - newLength;
        }

        this._startBase = Math.round(Math.max(MIN_ABS_BASE, start));
        this._endBase = Math.round(Math.min(end, navigableLength));
    }

    /**
     * Pans the current region by a constant number of bases, also ensuring view boundaries stay within the genome.
     * Negative numbers pull regions on the left into view (=pan right); positive numbers pull regions on the right into
     * view (=pan left).
     * 
     * Returns `this`.
     *
     * @param {number} numBases - number of base pairs to pan
     * @return {this}
     */
    pan(numBases) {
        this.setRegion(this._startBase + numBases, this._endBase + numBases);
        return this;
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
     * Returns `this`.
     *
     * @param {number} factor - number by which to multiply this region's width
     * @param {number} [focalPoint] - (optional) measured as number of region widths from the left edge.  Default: 0.5
     * @return {this}
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
        return this;
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
