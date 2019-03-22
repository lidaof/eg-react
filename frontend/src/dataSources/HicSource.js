import _ from 'lodash';
import Straw from 'hic-straw';
import DataSource from './DataSource';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { NormalizationMode } from '../model/HicDataModes';
import { GenomeInteraction } from '../model/GenomeInteraction';
import { ensureMaxListLength, findClosestNumber } from '../util';

/**
 * First, some monkey patching for juicebox.js
 */
/**
 * The original method matches chromosome names exactly.  This function does a fuzzier search.
 * 
 * @param {string} name - the chromosome name to find
 * @return {number} the index of the chromosome in the file, or `undefined` if not found.
 */
// window.hic.Dataset.prototype.getChrIndexFromName = function(name) {
//     if (!name) {
//         return;
//     }
//     let found = this.chromosomes.findIndex(chromosome => chromosome.name === name);
//     if (found !== -1) {
//         return found.index;
//     }

//     let modifiedName = name.replace("chrM", "MT");
//     modifiedName = modifiedName.replace("chr", "");
//     found = this.chromosomes.findIndex(chromosome => chromosome.name.toUpperCase() === modifiedName.toUpperCase());
//     return found !== -1 ? found : undefined;
// }

const MIN_BINS_PER_REGION = 50;

/**
 * Data source that fetches data from .hic files.
 * 
 * @author Silas Hsu
 */
export class HicSource extends DataSource {
    /**
     * Makes a new instance specialized in serving data from one URL
     *
     * @param {string} url - the URL to fetch data from
     */
    constructor(url) {
        super();
        this.straw = new Straw({ path: url });
        // this.datasetPromise = this.straw.reader.loadDataset({});
        // this.metadataPromise = null;
        // this.normVectorsPromise = null;
        this.metadata = null;
        this.normOptions = null;
    }

    /**
     * Loading normalization data is an expensive operation that takes a long time.  In order for `getData()` to return
     * normalized data, one must first call this method and wait for the returned promise to resolve.  The promise is
     * cached, so there is no issue in calling this method multiple times.
     * 
     * @return {Promise<void>} a promise that resolves when normalization data is finished loading
     */
    fetchNormalizationData() {
        if (!this.normVectorsPromise) {
            this.normVectorsPromise = this.straw.hicFile.readNormExpectedValuesAndNormVectorIndex();
        }
        return this.normVectorsPromise;
    }

    /**
    * Returns the largest bin size such at least MIN_BINS_PER_REGION fit in a region of the provided length.  If no such
    * bin size exists, because the input was too small or invalid, returns the smallest bin size.
    *
    * @param {DisplayedRegionModel} region - the region
    * @returns {number} the index of the recommended bin size for the region
    */
    getAutoBinSize(region) {
        const SORTED_BIN_SIZES = this.metadata.resolutions;
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
        return numberBinSize <= 0 ? this.getAutoBinSize(region) : 
            findClosestNumber(this.metadata.resolutions,numberBinSize);
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
        // if (normalization !== NormalizationMode.NONE) {
        //     await this.fetchNormalizationData();
        // }
        if (!this.normOptions.includes(normalization)) {
            return [];
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
     * @return {Promise<GenomeInteraction[]>} a Promise for the data
     */
    async getData(region, basesPerPixel, options) {
        await this.straw.hicFile.init();
        this.metadata = await this.straw.getMetaData();
        this.normOptions = await this.straw.getNormalizationOptions();
        const binSize = this.getBinSize(options, region);
        const promises = [];
        const loci = region.getGenomeIntervals();
        for (let i = 0; i < loci.length; i++) {
            for (let j = i; j < loci.length; j++) {
                promises.push(this.getInteractionsBetweenLoci(loci[i], loci[j], binSize, options.normalization));
            }
        }
        const dataForEachSegment = await Promise.all(promises);
        return _.flatMap(dataForEachSegment);
        // return ensureMaxListLength(_.flatMap(dataForEachSegment), 5000);
    }

    /**
     * Gets the genome-wide interaction map from the HiC file.
     * 
     * @param {NavigationContext} genome - genome metadata
     * @return {Promise<GenomeInteraction[]>} a Promise for the data
     */
    async getDataAll(genome) {
        if (!this.metadata) {
            this.metadata = await this.straw.getMetaData();
        }
        const binSize = this.straw.hicFile.wholeGenomeChromosome.size * 2;
        const allRecords = await this.straw.getContactRecords(NormalizationMode.NONE, {chr: "ALL"}, {chr: "ALL"}, "BP");
        const interactions = []
        for (const record of allRecords) {
            const locus1 = binToLocus(record.bin1);
            const locus2 = binToLocus(record.bin2);
            if (locus1 && locus2) {
                interactions.push(new GenomeInteraction(locus1, locus2, record.counts));
            }
        }
        return interactions;

        function binToLocus(bin) {
            const absStart = bin * binSize;
            const absEnd = (bin + 1) * binSize;
            return genome.getLociInInterval(absStart, absEnd)[0];
        }
    }
}
