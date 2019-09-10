import DataSource from './DataSource';
import G3dFile from 'g3djs';

/**
 * Data source that fetches data from .g3d files.
 * 
 * @author Daofeng Li
 */
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
     * Gets g3d data in the view region for each chromsome.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {number} basesPerPixel - bases per pixel.  Higher = more zoomed out
     * @param {Object} options - rendering options
     * @return {Promise<structure data in string[]>} a Promise for the data
     */
    async getData(region, basesPerPixel, options) {
        this.metadata = await this.g3d.getMetaData();
        const promises = [];
        const loci = region.getGenomeIntervals();
        for (let i = 0; i < loci.length; i++) {
            promises.push(this.g3d.readData(loci[i].chr));
        }
        const dataForEachSegment = await Promise.all(promises);
        return dataForEachSegment;
    }
}
