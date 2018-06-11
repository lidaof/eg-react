import OpenInterval from "./OpenInterval";

type PaddingFunc = (interval: OpenInterval) => number;

/**
 * Arranges intervals into rows so they avoid overlap as much as possible when drawn.  Intervals MUST have props
 * `start`, `end`, and `getLength()`.
 * 
 * @author Silas Hsu
 */
class IntervalArranger {
    isConstPadding: boolean;
    rowsRecentlyAssigned: number;
    padding: number | PaddingFunc;

    /**
     * Makes a new instance configured with horizontal padding for intervals:
     * * If it is a number, all intervals will have that constant padding.
     * * If it is a function, it should take one interval and return the horizontal padding.
     * 
     * @param {number | function} [getPadding] - horizontal padding for intervals
     */
    constructor(padding=0) {
        this.isConstPadding = typeof padding === "number";
        this.padding = padding;
        this.rowsRecentlyAssigned = 0;
    }

    /**
     * Assigns each interval a row index.
     * 
     * @param {OpenInterval[]} intervals - intervals to which to assign row indicies
     * @return {number[]} assigned row index for each interval
     */
    arrange(intervals: OpenInterval[]): number[] {
        const maxXsForRows: number[] = [];
        const rowAssignments: number[] = [];
        for (const interval of intervals) {
            const horizontalPadding = this.isConstPadding ? (this.padding as number) : (this.padding as PaddingFunc)(interval);
            const startX = interval.start - horizontalPadding;
            const endX = interval.end + horizontalPadding;
            // Find the first row where the interval won't overlap with others in the row
            let row = maxXsForRows.findIndex(maxX => maxX < startX);
            if (row === -1) { // Couldn't find a row -- make a new one
                maxXsForRows.push(endX);
                row = maxXsForRows.length - 1;
            } else {
                maxXsForRows[row] = endX;
            }
            rowAssignments.push(row);
        }

        this.rowsRecentlyAssigned = maxXsForRows.length;
        return rowAssignments;
    }

    /**
     * @return {number} the number of rows assigned in the most recent call to arrange()
     */
    getNumRowsAssigned(): number {
        return this.rowsRecentlyAssigned;
    }
}

export default IntervalArranger;
