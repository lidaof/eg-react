/**
 * Records for the the {@link BarChart} component to display.  Stores an interval of absolute base numbers, along with
 * the value in that interval.
 * 
 * @author Silas Hsu
 */
class BarChartRecord {
    /**
     * Makes a container that stores an interval and value.
     * 
     * @param {number} start - start absolute base number of the interval
     * @param {number} end - end absolute base number of the interval
     * @param {number} value - the value to display
     */
    constructor(start, end, value) {
        this.start = start;
        this.end = end;
        this.value = value;
    }
}

export default BarChartRecord;
