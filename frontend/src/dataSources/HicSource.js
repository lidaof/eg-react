import _ from 'lodash';
import DataSource from './DataSource';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { GenomeInteraction } from '../model/GenomeInteraction';

/**
 * First, some monkey patching for juicebox.js
 */
/**
 * The original method matches chromosome names exactly.  This function does a fuzzier search.
 * 
 * @param {string} name - the chromosome name to find
 * @return {number} the index of the chromosome in the file, or `undefined` if not found.
 */
window.hic.Dataset.prototype.getChrIndexFromName = function(name) {
    if (!name) {
        return;
    }
    let found = this.chromosomes.findIndex(chromosome => chromosome.name === name);
    if (found !== -1) {
        return found.index;
    }

    let modifiedName = name.replace("chrM", "MT");
    modifiedName = modifiedName.replace("chr", "");
    found = this.chromosomes.findIndex(chromosome => chromosome.name === modifiedName);
    return found !== -1 ? found : undefined;
}

const MIN_BINS_PER_REGION = 50;
const BIN_SIZES = [2500000, 1000000, 500000, 250000, 100000, 50000, 25000, 10000, 5000];

export class HicSource extends DataSource {
    constructor(url) {
        super();
        this.straw = new window.hic.Straw({ url: url });
    }

    /**
    * Returns the largest bin size such at least MIN_BINS_PER_REGION fit in a region of the provided length.  If no such
    * bin size exists, because the input was too small or invalid, returns the smallest bin size.
    *
    * @param {number} regionLength - the length of the region
    * @returns {number} the index of the recommended bin size for the region
    */
    getAutoBinSize(regionLength) {
        for (let binSize of BIN_SIZES) { // BIN_SIZES must be sorted from largest to smallest!
            if (MIN_BINS_PER_REGION * binSize < regionLength) {
                return binSize;
            }
        }
        return BIN_SIZES[BIN_SIZES.length - 1];
    }

    /**
     * FIXME this doesn't do well in region set view.  Errors abound from Juicebox.
     * 
     * @param {ChromosomeInterval} queryLocus1 
     * @param {ChromosomeInterval} queryLocus2 
     * @param {number} binSize 
     */
    async getInteractionsBetweenLoci(queryLocus1, queryLocus2, binSize) {
        // NONE/VC/VC_SQRT/KR  normalization
        const records = await this.straw.getContactRecords('NONE', queryLocus1, queryLocus2, 'BP', binSize);
        const interactions = [];
        for (const record of records) {
            const recordLocus1 = new ChromosomeInterval(
                queryLocus1.chr, record.bin1 * binSize, (record.bin1 + 1) * binSize
            );
            const recordLocus2 = new ChromosomeInterval(
                queryLocus2.chr, record.bin2 * binSize, (record.bin2 + 1) * binSize
            );
            interactions.push(new GenomeInteraction(recordLocus1, recordLocus2, record.counts));
        }
        return interactions;
    }

    /**
     * Gets HiC data in the view region.  Note that only a triangular portion of the contact matrix is returned.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {number} basesPerPixel - bases per pixel.  Higher = more zoomed out
     * @param {Object} options - rendering options
     * @return {Promise<ContactRecord>} a Promise for the data
     */
    async getData(region, basesPerPixel, options) {
        const binSize = options.binSize || this.getAutoBinSize(region.getWidth());
        const promises = [];
        const loci = region.getGenomeIntervals();
        for (const [index1,locus1] of loci.entries()) {
            for (const locus2 of loci.slice(index1)) {
                promises.push(this.getInteractionsBetweenLoci(locus1, locus2, binSize));
            }
        }
        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment);
    }

    async getDataAll(region, options) {
        const binSize = options.binSize || this.getAutoBinSize(region.getWidth());
        const promises = [];
        const loci = region.getGenomeIntervals();
        const locus2 = new ChromosomeInterval('chr7', 0, 145441459);
        for (const locus1 of loci) {
            promises.push(this.getInteractionsBetweenLoci(locus1, locus2, binSize));
        }
        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment);
    }
}
