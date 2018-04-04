class DataFormatter {
    /**
     * Converts data to some other format.  Default implementation returns the data unmodified.
     * 
     * @param {any[]} data 
     * @return {any}
     */
    format(data) {
        return data;
    }
}

export default DataFormatter;
