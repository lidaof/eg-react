/**
 * Arranges intervals into rows so they avoid overlap as much as possible when drawn.  Intervals MUST have props
 * `absStart` and `absEnd`.
 * 
 * @author Silas Hsu
 */
class IntervalArranger {
    /**
     * Makes a new instance configured with options:
     *  * `getPadding`: a function used to get horizontal padding for each interval.  It will get the interval as an
     * argument and should return the padding as a number.  By default, all intervals get a padding of 0.
     *  * `numRows`: maximum number of rows in which to place intervals.  If a interval does not fit, it is given a row
     * index of -1.  Default: 10
     * 
     * @param {LinearDrawingModel} drawModel - model for determining where intervals will display
     * @param {function} [getPadding] - function that gets padding for each interval
     * @param {number} [numRows] - maximum number of rows
     */
    constructor(drawModel, numRows=10, getPadding=(interval => 0)) {
        this.drawModel = drawModel;
        this.getPadding = getPadding;
        this.numRows = numRows;
    }

    /**
     * Sorts intervals by absolute start base.  If two intervals they have the same start position, the longer interval
     * comes first.
     * 
     * @param {Object[]} intervals - intervals to sort
     * @return {Object[]} sorted intervals
     */
    _sortIntervals(intervals) {
        return intervals.sort((interval1, interval2) => {
            const absStartComparison = interval1.absStart - interval2.absStart;
            if (absStartComparison === 0) {
                const interval1Length = interval1.absEnd - interval1.absStart;
                const interval2Length = interval2.absEnd - interval2.absStart;
                return interval2Length - interval1Length;
            } else {
                return absStartComparison;
            }
        });
    }

    /**
     * Assigns each intervals a row index, or an index equal to the maximum number of rows if the interval will not fit
     * into this instance's maximum configured rows.  Each interval requires two props: `absStart` and `absEnd`.
     * 
     * @param {AbsoluteInterval[]} intervals - intervals to which to assign row indicies
     * @return {number[]} assigned row index for each interval
     */
    arrange(intervals) {
        if (this.numRows <= 0) {
            return new Array(intervals.length).fill(-1);
        }

        let maxXsForRows = new Array(this.numRows).fill(-Infinity);
        let rowIndices = [];
        const sortedIntervals = this._sortIntervals(intervals);
        for (let interval of sortedIntervals) {
            const horizontalPadding = this.getPadding(interval);
            const startX = this.drawModel.baseToX(interval.absStart) - horizontalPadding;
            // Find the first row where the annotation won't overlap with others in the row
            let row = maxXsForRows.findIndex(maxX => maxX < startX);
            if (row !== -1) {
                const endX = this.drawModel.baseToX(interval.absEnd);
                maxXsForRows[row] = endX + horizontalPadding;
            }

            rowIndices.push(row);
        }

        return rowIndices;
    }
}

export default IntervalArranger;

/**
 * @typedef {Object} IntervalArranger~AbsoluteInterval
 * @property {number} absStart - start of interval
 * @property {number} absEnd - end of interval
 */
