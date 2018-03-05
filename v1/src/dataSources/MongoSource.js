import DataSource from './DataSource';
import axios from 'axios';

/**
 * A DataSource that gets annotations from mongodb.  
 * @author: Daofeng Li
 */
class MongoSource extends DataSource {
    /**
     * Makes a new instance specialized to serve data from a url.  Fetching data will return BedRecords by default,
     * unless given a BedFormatter.
     * 
     * @param {DBFormatter} [dbFormatter] - converter from dbRecords to some other format
     */
    constructor(dbFormatter) {
        super();
        this.dbFormatter = dbFormatter;
    }

    /**
     * Gets data lying within the region.  Returns a promise for an array of data.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {Object} [options] - data fetching options
     * @return {Promise<Object[]>} promise for data
     * @override
     */
    async getData(region, options) {
        let promises = region.getFeatureIntervals().map(async featureInterval => {
            const chrInterval = featureInterval.getGenomeCoordinates();
            const dbResponse = await axios.get(`/hg19/geneQuery/${chrInterval.chr}/${chrInterval.start}/${chrInterval.end}`);
            const dbRecords = dbResponse.data;
            if (this.dbFormatter) {
                return this.dbFormatter.format(dbRecords, region, featureInterval);
            } else {
                return dbRecords;
            }
        });

        const dataForEachSegment = await Promise.all(promises);
        return [].concat.apply([], dataForEachSegment);
    }
}

export default MongoSource;
