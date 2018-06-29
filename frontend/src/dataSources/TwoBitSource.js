import DataSource from './DataSource';
const twoBit = require('../vendor/bbi-js/main/twoBit');
const bin = require('../vendor/bbi-js/utils/bin');

/**
 * Reads and gets data from remotely-hosted .2bit files.
 * 
 * @author Daofeng Li
 */
class TwoBitSource extends DataSource {
    /**
     * Prepares to fetch .2bit data from a URL.
     * 
     * @param {string} url - the URL from which to fetch data
     */
    constructor(url) {
        super();
        this.url = url;
        this.twoBitPromise = new Promise((resolve, reject) => {
            twoBit.makeTwoBit(new bin.URLFetchable(url), (twoBitObj, error) => {
                if (error) {
                    reject(error);
                }
                resolve(twoBitObj);
            });
        });
    }

    /**
     * Gets the sequence that covers the region.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @return {Promise<string>} - sequence in the region
     */
    async getData(region) {
        const promises = region.getFeatureSegments().map(segment =>
            this.getSequenceInInterval(segment.getGenomeCoordinates())
        );
        const sequences = await Promise.all(promises);
        return sequences.join("");
    }

    /**
     * Gets the sequence for a single chromosome interval.
     * 
     * @param {ChromosomeInterval} interval - coordinates
     * @return {Promise<string>} - a Promise for the sequence
     */
    async getSequenceInInterval(interval) {
        const twoBitObj = await this.twoBitPromise;
        return new Promise((resolve, reject) => {
            // bbi-js assumes coordinates are 1-indexed, while our coordinates are 0-indexed.  +1 to compensate.
            twoBitObj.fetch(interval.chr, interval.start + 1, interval.end, (data, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data)
                }
            });
        });
    }

}

export default TwoBitSource;
