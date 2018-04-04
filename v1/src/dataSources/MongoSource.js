import DataSource from './DataSource';
import axios from 'axios';
import DataFormatter from './DataFormatter';

/**
 * A DataSource that gets gene annotations from our backend.
 *  
 * @author Daofeng Li
 */
class MongoSource extends DataSource {
    /**
     * Makes a new instance.  Fetching data will return raw object records by default, unless given a DataFormatter.
     * 
     * @param {DataFormatter} [formatter] - converter of data to some other format
     */
    constructor(formatter=new DataFormatter()) {
        super();
        this.formatter = formatter;
    }

    /**
     * @inheritdoc
     */
    async getData(region, options) {
        let promises = region.getFeatureIntervals().map(async featureInterval => {
            const chrInterval = featureInterval.getGenomeCoordinates();
            const dbResponse = await axios.get(`/hg19/geneQuery/${chrInterval.chr}/${chrInterval.start}/${chrInterval.end}`);
            return dbResponse.data;
        });

        const dataForEachSegment = await Promise.all(promises);
        const allData = [].concat.apply([], dataForEachSegment);
        return this.formatter.format(allData);
    }
}

export default MongoSource;
