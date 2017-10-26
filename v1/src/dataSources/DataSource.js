/**
 * An abstract class that represents a source of data for Tracks
 * 
 * @author Silas Hsu
 */
class DataSource {
    /**
     * Gets data lying within the region, and surrounding ones as well if a RegionExpander is passed.
     * 
     * @param {DisplayedRegionModel} region - the model containing the displayed region
     * @return {Promise<any>} a Promise for the data
     */
    getData(region) {
        throw new Error("Not implemented");
    }
}

export default DataSource;
