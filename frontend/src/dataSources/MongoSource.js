import axios from 'axios';
import _ from 'lodash';

import DataSource from './DataSource';
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
        let promises = region.getGenomeIntervals().map(locus =>
            /**
             * Gets an object that looks like {data: []}
             */
            axios.get(`/hg19/geneQuery/${locus.chr}/${locus.start}/${locus.end}`)
        );

        const dataForEachSegment = await Promise.all(promises);
        const allData = _.flatMap(dataForEachSegment, 'data');
        return this.formatter.format(allData);
    }
}

export default MongoSource;
