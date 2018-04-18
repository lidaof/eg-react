import axios from 'axios';
import _ from 'lodash';
import DataSource from './DataSource';

/**
 * A DataSource that gets gene annotations from our backend.
 *  
 * @author Daofeng Li
 */
class MongoSource extends DataSource {
    /**
     * @inheritdoc
     */
    async getData(region, options) {
        let promises = region.getGenomeIntervals().map(locus => {
            const params = {
                chr: locus.chr,
                start: locus.start,
                end: locus.end
            };
            /**
             * Gets an object that looks like {data: []}
             */
            return axios.get(`/hg19/genes/queryRegion`, {params: params});
        });

        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment, 'data');
    }
}

export default MongoSource;
