import DataSource from './DataSource';
import G3dFile from 'g3djs';
import { findClosestNumber } from '../util';
import { RegionMode } from 'model/G3dDataModes';

/**
 * Data source that fetches data from .g3d files.
 *
 * @author Daofeng Li
 */

const MIN_BINS_PER_REGION = 100;

export class G3dSource extends DataSource {
    /**
     * Makes a new instance specialized in serving data from one URL
     *
     * @param {string} url - the URL to fetch data from
     */
    constructor(url) {
        super();
        let config;
        if (typeof url === 'string') {
            config = { url };
        } else {
            config = { blob: url };
        }
        this.g3d = new G3dFile(config);
        this.metadata = null;
    }

    /**
     * Returns the largest bin size such at least MIN_BINS_PER_REGION fit in a region of the provided length.  If no such
     * bin size exists, because the input was too small or invalid, returns the smallest bin size.
     *
     * @param {DisplayedRegionModel} region - the region
     * @returns {number} the index of the recommended bin size for the region
     */
    getAutoResolution(region) {
        const SORTED_BIN_SIZES = this.metadata.resolutions.sort((a, b) => b - a);
        const regionLength = region.getWidth();
        for (const resolution of SORTED_BIN_SIZES) {
            // SORTED_BIN_SIZES must be sorted from largest to smallest!
            if (MIN_BINS_PER_REGION * resolution < regionLength) {
                return resolution;
            }
        }
        return SORTED_BIN_SIZES[SORTED_BIN_SIZES.length - 1];
    }

    /**
     * Gets the bin size to use during data fetch
     *
     * @param {TrackOptions} options - G3D track options
     * @param {DisplayedRegionModel} region - region to fetch, to be used in case of auto bin size
     * @return {number} bin size to use during data fetch
     */
    getResolution(options, region) {
        const selectedResolution = Number(options.resolution) || 0;
        return selectedResolution <= 0
            ? this.getAutoResolution(region)
            : findClosestNumber(this.metadata.resolutions, selectedResolution);
    }

    /**
     * Gets g3d data in the view region for each chromsome.
     *
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {number} basesPerPixel - bases per pixel.  Higher = more zoomed out
     * @param {Object} options - rendering options
     * @return {Promise<structure data in string[]>} a Promise for the data
     */
    async getData(region, basesPerPixel, options) {
        this.metadata = await this.g3d.getMetaData();
        const resolution = this.getResolution(options, region);
        const promises = [];
        const loci = region.getGenomeIntervals();
        for (let i = 0; i < loci.length; i++) {
            switch (options.region) {
                case RegionMode.CHROMOSOME:
                    promises.push(this.g3d.readDataChromosome(loci[i].chr, resolution));
                    break;
                case RegionMode.GENOME:
                    promises.push(this.g3d.readDataGenome(resolution));
                    break;
                case RegionMode.REGION:
                default:
                    promises.push(this.g3d.readData(loci[i].chr, loci[i].start, loci[i].end, resolution));
                    break;
            }
        }
        const dataForEachSegment = await Promise.all(promises);
        return dataForEachSegment;
    }
}
