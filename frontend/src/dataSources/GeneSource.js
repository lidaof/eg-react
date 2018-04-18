import axios from 'axios';
import _ from 'lodash';
import DataSource from './DataSource';

/**
 * A DataSource that calls our backend API for gene annotations.
 *  
 * @author Daofeng Li
 */
class GeneSource extends DataSource {
    /**
     * Makes a new instance, specialized to fetch data from a specific genome.
     * 
     * @param {string} genomeName - genome for which to fetch data
     */
    constructor(genomeName) {
        super();
        if (!genomeName) {
            console.warn("No genome name specified.  This data source will fetch no data!");
        }
        this.genomeName = genomeName;
    }

    /**
     * @inheritdoc
     */
    async getData(region, options) {
        if (!this.genomeName) {
            return [];
        }

        let promises = region.getGenomeIntervals().map(locus => {
            const params = {
                chr: locus.chr,
                start: locus.start,
                end: locus.end
            };
            /**
             * Gets an object that looks like {data: []}
             */
            return axios.get(`/${this.genomeName}/genes/queryRegion`, {params: params});
        });

        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment, 'data');
    }
}

export default GeneSource;
