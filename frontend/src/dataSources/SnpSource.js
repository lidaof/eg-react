import axios from 'axios';
import _ from 'lodash';
import DataSource from './DataSource';

const SNP_REGION_API = {
    'hg19': 'https://grch37.rest.ensembl.org/overlap/region/human',
    'hg38': 'https://rest.ensembl.org/overlap/region/human',
};

/**
 * A DataSource that calls our Ensembl API for snp information.
 *
 * @author Daofeng Li
 */
class SnpSource extends DataSource {
    /**
     * Makes a new instance, specialized to fetch data from a specific genome.
     *
     * @param {object} trackModel - genome for which to fetch data
     */
    constructor(trackModel) {
        super();
        if (!trackModel) {
            console.warn('No track model specified.  This data source will fetch no data!');
        }
        this.trackModel = trackModel;
    }

    /**
     * @inheritdoc
     */
    async getData(region) {
        if (!this.trackModel) {
            return [];
        }
        const genome = this.trackModel.getMetadata('genome') || this.trackModel.genome;
        const api = SNP_REGION_API[genome] || null;
        if (!api) {
            return [];
        }
        const params = {
            'content-type': 'application/json',
            'feature': 'variation',
        };
        let promises = region.getGenomeIntervals().map(locus => {
            if (locus.getLength() <= 10000) {
                /**
                 * Gets an object that looks like {data: []}
                 */
                return axios.get(`${api}/${locus.chr.substr(3)}:${locus.start+1}-${locus.end}`, {
                    params: params
                });
            } else {
                return {data: []};
            }
        });
        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment, 'data');
    }
}

export default SnpSource;
