import axios from 'axios';
import _ from 'lodash';
import DataSource from './DataSource';


export const AWS_API = "https://api.epigenomegateway.org";
/**
 * A DataSource that calls our backend API for gene annotations.
 *
 * @author Daofeng Li
 */
class GeneSource extends DataSource {
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

        let promises = region.getGenomeIntervals().map(locus => {
            const params = {
                chr: locus.chr,
                start: locus.start,
                end: locus.end
            };
            const genome = this.trackModel.getMetadata('genome') || this.trackModel.genome;

            /**
             * Gets an object that looks like {data: []}
             */
            return axios.get(`${AWS_API}/${genome}/genes/${this.trackModel.name}/queryRegion`, {
                params: params
            });
        });

        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment, 'data');
    }
}

export default GeneSource;
