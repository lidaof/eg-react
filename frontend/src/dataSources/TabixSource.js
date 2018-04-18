import DataSource from './DataSource';
import _ from 'lodash';

const tabix = require('../vendor/bbi-js/main/tabix');
const bin = require('../vendor/bbi-js/utils/bin');

/**
 * Reads and gets data from remotely-hosted .gz files.
 * 
 * @author Daofeng Li
 */
class TabixSource extends DataSource {
    /**
     * Prepares to fetch tabix .gz data from a URL.
     * 
     * @param {string} url - the URL from which to fetch data
     */
    constructor(url) {
        super();
        this.url = url;
        const indexURL = `${url}.tbi`;
        this.tabixPromise = new Promise((resolve, reject) => {
            tabix.connectTabix(new bin.URLFetchable(url), new bin.URLFetchable(indexURL), (tabixObj, error) => {
                if (error) {
                    reject(error);
                }
                resolve(tabixObj);
            });
        });
    }

    /**
     * Gets the feature that covers the region.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @return {Promise<string>} - feature in the region
     */
    async getData(region) {
        const promises = region.getFeatureIntervals().map(interval =>
            this.getFeaturesInInterval(interval.getGenomeCoordinates())
        );
        const features = await Promise.all(promises);
        //console.log(features);
        return _.flatten(features);
    }

    /**
     * Gets the feature for a single chromosome interval.
     * 
     * @param {ChromosomeInterval} interval - coordinates
     * @return {Promise<string>} - a Promise for the feature
     */
    async getFeaturesInInterval(interval) {
        const tabixObj = await this.tabixPromise;
        return new Promise((resolve, reject) => {
            // We Math.max because the bbi-js API errors if given 0 as a start.
            tabixObj.fetch(interval.chr, Math.max(1, interval.start), interval.end, (data, error) => {
                if (error) {
                    reject(error);
                } else {
                    //console.log(data);
                    resolve(data)
                }
            });
        });
    }

}

export default TabixSource;
