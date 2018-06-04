/**
 * An abstract class that represents a source of data for a view region.
 * 
 * @author Silas Hsu
 */
class DataSource {
    /**
     * Gets data in the view region.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {number} pixelsPerBase - pixels per base, or resolution of the data
     * @param {Object} options - rendering options
     * @return {Promise<any>} a Promise for the data
     */
    getData(region, pixelsPerBase, options) {
        throw new Error("Not implemented");
    }

    /**
     * Functions as this object's destructor; deallocates anything that needs manual deallocation.
     */
    cleanUp() {

    }
}

export default DataSource;
