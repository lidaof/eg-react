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
        let promises = region.getGenomeIntervals().map(locus =>
            /**
             * Gets an object that looks like {data: []}
             */
            axios.get(`/hg19/geneQuery/${locus.chr}/${locus.start}/${locus.end}`)
        );

        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment, 'data');
    }
}

export default MongoSource;
