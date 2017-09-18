/**
 * An abstract class that represents a source of data for Tracks
 * 
 * @author Silas Hsu
 */
class DataSource {
    /**
     * Gets data lying within the region.
     * 
     * @param {DisplayedRegionModel} regionModel - the model containing the displayed region
     * @return {Promise<any>} a Promise for the data
     */
    getData(regionModel) {
        throw new Error("Not implemented");
    }
}

export default DataSource;
