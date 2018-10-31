import axios from "axios";
import DataSource from './DataSource';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { GenomeInteraction } from '../model/GenomeInteraction';

const HIGLASS_API_URL = "http://higlass.io/api/v1/fragments_by_loci/";
const MATRIX_SIZE = 50; // how many data chunks returned from the API for a query region

export class CoolSource extends DataSource {
    constructor(url) {
        super();
        this.dataUuid = url;
    }

    /**
     * FIXME this doesn't do well in region set view.
     * 
     * @param {ChromosomeInterval} queryLocus1 
     * @param {ChromosomeInterval} queryLocus2 
     * @param {number} binSize 
     */
    async getInteractionsBetweenLoci(queryLocus1, queryLocus2) {
        const records = await axios({
            method: "post",
            url: HIGLASS_API_URL,
            data: [[queryLocus1.chr, queryLocus1.start, queryLocus1.end, 
                queryLocus2.chr, queryLocus2.start, queryLocus2.end, this.dataUuid, 0]],
            params: {
                dims: MATRIX_SIZE,
                precision: 3
              },
        });
        const basesPerCell1 = Math.round(queryLocus1.getLength() / MATRIX_SIZE);
        const basesPerCell2 = Math.round(queryLocus2.getLength() / MATRIX_SIZE);
        const interactions = [];
        for (let i = 0; i < MATRIX_SIZE; i++) {
            for (let j = i; j < MATRIX_SIZE; j++) {
                // Upper triangle of the contact matrix
                const recordLocus1 = new ChromosomeInterval(
                    queryLocus1.chr, queryLocus1.start + i*basesPerCell1, queryLocus1.start + (i+1)*basesPerCell1
                );
                const recordLocus2 = new ChromosomeInterval(
                    queryLocus2.chr, queryLocus2.start + j*basesPerCell2, queryLocus2.start + (j+1)*basesPerCell2
                );
                interactions.push(new GenomeInteraction(recordLocus1, recordLocus2, records.data.fragments[0][i][j]));
            }
        }
        return interactions;
    }

    /**
     * Gets cool data in the view region.  Note that only a triangular portion of the contact matrix is returned.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {number} basesPerPixel - bases per pixel.  Higher = more zoomed out
     * @param {Object} options - rendering options
     * @return {Promise<ContactRecord>} a Promise for the data
     */
    async getData(region, basesPerPixel, options={}) {
        const promises = [];
        const loci = region.getGenomeIntervals();
        for (let i = 0; i < loci.length; i++) {
            for (let j = i; j < loci.length; j++) {
                promises.push(await this.getInteractionsBetweenLoci(loci[i], loci[j]));
            }
        }
        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment);
    }
}
