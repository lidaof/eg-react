/**
 * An abstract class that represents a source of data for a specific region.
 * 
 * @author Silas Hsu
 */
class DataSource {
    /**
     * Gets data lying within the region.
     * 
     * @param {DisplayedRegionModel} region - the model containing the displayed region
     * @return {Promise<any>} a Promise for the data
     */
    getData(region) {
        throw new Error("Not implemented");
    }

    /**
     * Functions as this object's destructor; deallocates anything that needs manual deallocation.
     */
    cleanUp() {

    }
}

export default DataSource;
