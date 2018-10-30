import axios from "axios";
import DataSource from './DataSource';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { GenomeInteraction } from '../model/GenomeInteraction';

const HIGLASS_API = "http://higlass.io/api/v1/fragments_by_loci/";

export class CoolSource extends DataSource {
    constructor(url) {
        super();
        this.dataUuid = url;
        console.log(this.dataUuid);
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
            url: HIGLASS_API,
            data: [[queryLocus1.chr, queryLocus1.start, queryLocus1.end, 
                queryLocus2.chr, queryLocus2.start, queryLocus2.end, this.dataUuid, 0]],
            params: {
                dims: 50
              },
        });
        const step1 = Math.round(queryLocus1.getLength() / 50);
        const step2 = Math.round(queryLocus2.getLength() / 50);
        const interactions = [];
        let i, j;
        for (i=0; i < 50; i++) {
            for (j=0; j < 50; j++) {
                if (j >= i) { // up triangle
                    const recordLocus1 = new ChromosomeInterval(
                        queryLocus1.chr, queryLocus1.start + i*step1, queryLocus1.start + (i+1)*step1
                    );
                    const recordLocus2 = new ChromosomeInterval(
                        queryLocus2.chr, queryLocus2.start + j*step2, queryLocus2.start + (j+1)*step2
                    );
                    interactions.push(new GenomeInteraction(recordLocus1, recordLocus2, records[i][j]));
                }
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
        for (const [index1,locus1] of loci.entries()) {
            for (const locus2 of loci.slice(index1)) {
                promises.push(this.getInteractionsBetweenLoci(locus1, locus2));
            }
        }
        const dataForEachSegment = await Promise.all(promises);
        console.log(dataForEachSegment);
        return _.flatMap(dataForEachSegment);
    }
}
