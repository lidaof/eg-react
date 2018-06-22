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

const MIN_BINS_PER_REGION = 75;
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
        return 10000;
        for (let binSize of BIN_SIZES) { // BIN_SIZES must be sorted from largest to smallest!
            if (MIN_BINS_PER_REGION * binSize < regionLength) {
                return binSize;
            }
        }
        return BIN_SIZES[BIN_SIZES.length - 1];
    }

    /**
     * 
     * @param {hic.ContactRecord} contactRecord 
     * @param {string} chrName
     * @param {number} binSize - bin size, in base pairs
     */
    makeRecord(contactRecord, chrName1, chrName2, binSize) {
        const locus1 = new ChromosomeInterval(
            chrName1, contactRecord.bin1 * binSize, (contactRecord.bin1 + 1) * binSize
        );
        const locus2 = new ChromosomeInterval(
            chrName2, contactRecord.bin2 * binSize, (contactRecord.bin2 + 1) * binSize
        );
        return new GenomeInteraction(locus1, locus2, contactRecord.counts);
    }

    /**
     * Gets data in the view region.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {number} basesPerPixel - bases per pixel.  Higher = more zoomed out
     * @param {Object} options - rendering options
     * @return {Promise<ContactRecord>} a Promise for the data
     */
    async getData(region, basesPerPixel, options) {
        const binSize = options.binSize || this.getAutoBinSize(region.getWidth());
        let promises = region.getGenomeIntervals().map(async locus => {
            const records = await this.straw.getContactRecords('NONE', locus, locus, 'BP', binSize);
            // Example of a record: {bin1: 2706, bin2: 2706, counts: 3979}
            return records.map(record => this.makeRecord(record, locus.chr, locus.chr, binSize));
        });
        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment);
    }
}
