import _ from 'lodash';
import DataSource from './DataSource';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { NormalizationMode, SORTED_BIN_SIZES, BinSize } from 'src/model/HicDataModes';
import { GenomeInteraction } from '../model/GenomeInteraction';
import { ensureMaxListLength } from '../util';

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

export class HicSource extends DataSource {
    constructor(url) {
        super();
        this.straw = new window.hic.Straw({ url: url });
        this.normVectorsPromise = this.straw.reader.loadDataset({})
            .then(dataset => this.straw.reader.readNormExpectedValuesAndNormVectorIndex(dataset))
    }

    /**
    * Returns the largest bin size such at least MIN_BINS_PER_REGION fit in a region of the provided length.  If no such
    * bin size exists, because the input was too small or invalid, returns the smallest bin size.
    *
    * @param {DisplayedRegionModel} region - the region
    * @returns {number} the index of the recommended bin size for the region
    */
    getAutoBinSize(region) {
        const regionLength = region.getWidth();
        for (const binSize of SORTED_BIN_SIZES) { // SORTED_BIN_SIZES must be sorted from largest to smallest!
            if (MIN_BINS_PER_REGION * binSize < regionLength) {
                return binSize;
            }
        } 
        return SORTED_BIN_SIZES[SORTED_BIN_SIZES.length - 1];
    }

    /**
     * Gets the bin size to use during data fetch
     * 
     * @param {TrackOptions} options - HiC track options
     * @param {DisplayedRegionModel} region - region to fetch, to be used in case of auto bin size
     * @return {number} bin size to use during data fetch
     */
    getBinSize(options, region) {
        const numberBinSize = Number(options.binSize) || 0;
        return numberBinSize <= 0 ? this.getAutoBinSize(region) : numberBinSize;
    }

    /**
     * FIXME this doesn't do well in region set view.  Errors abound from Juicebox.
     * 
     * @param {ChromosomeInterval} queryLocus1 
     * @param {ChromosomeInterval} queryLocus2 
     * @param {number} binSize 
     * @param {NormalizationMode} normalization
     * @return {GenomeInteraction[]} 
     */
    async getInteractionsBetweenLoci(queryLocus1, queryLocus2, binSize, normalization=NormalizationMode.NONE) {
        if (normalization !== NormalizationMode.NONE) {
            await this.normVectorsPromise;
        }
        const records = await this.straw.getContactRecords(normalization, queryLocus1, queryLocus2, 'BP', binSize);
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
        const binSize = this.getBinSize(options, region);
        const promises = [];
        const loci = region.getGenomeIntervals();
        for (let i = 0; i < loci.length; i++) {
            for (let j = i; j < loci.length; j++) {
                promises.push(this.getInteractionsBetweenLoci(loci[i], loci[j], binSize, options.normalization));
            }
        }
        const dataForEachSegment = await Promise.all(promises);
        return ensureMaxListLength(_.flatMap(dataForEachSegment), 5000);
    }

    async getDataAll(region, options) {
        const binSize = this.getBinSize(options, region);
        const promises = [];
        const loci = region.getGenomeIntervals();
        const navContext = region.getNavigationContext();
        for (let feature of navContext.getFeatures()) {
            for (const locus1 of loci) {
                const locus2 = feature.getLocus();
                if (locus2.chr === 'chrM') {
                    continue;
                }
                promises.push(this.getInteractionsBetweenLoci(locus1, locus2, binSize));
            }
        }
        const dataForEachSegment = await Promise.all(promises);
        const allData =  _.flatMap(dataForEachSegment);
        const chrSets = new Set(loci.map(item => item.chr));
        const chrData = allData.filter(item => chrSets.has(item.locus1.chr) && chrSets.has(item.locus2.chr));
        return [ensureMaxListLength(chrData, 5000), ensureMaxListLength(allData, 5000)];
    }
}
