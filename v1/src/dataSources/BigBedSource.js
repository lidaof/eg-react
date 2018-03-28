import DataSource from './DataSource';

const bbi = require('../vendor/bbi-js/main/bigwig');
const bin = require('../vendor/bbi-js/utils/bin');

/**
 * Reads and gets data from .2bit files hosted remotely.
 * 
 * @author Daofeng Li
 */
class BigBedSource extends DataSource {
    /**
     * Prepares to fetch .2bit data from a URL.
     * 
     * @param {string} url - the URL from which to fetch data
     */
    constructor(url) {
        super();
        this.url = url;
        this.BigBedPromise = new Promise((resolve, reject) => {
            bbi.makeBwg(new bin.URLFetchable(url), (bbObj, error) => {
                if (error) {
                    reject(error);
                }
                resolve(bbObj);
            });
        });
    }

    
    /**
     * Gets sequence stored in a single chromosome interval.
     * 
     * @param {ChromosomeInterval} interval - coordinates
     * @param {bb} bbObj 
     * @return {Promise} - a Promise for the features in the interval 
     */
    _getFeaturesForChromosome(interval, bbObj) {
        return new Promise((resolve, reject) => {
            bbObj.readWigData(interval.chr, ...interval, (features, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(features)
                }
            });
        });
    }

    /**
     * Gets sequence stored in a single chromosome interval.
     * 
     * @param {ChromosomeInterval} interval - coordinates
     * @return {string} - sequence in the interval, 
     */
    async getData(interval) {

        const bbObj = await this.BigBedPromise;

        const features = await this._getFeaturesForChromosome(interval, bbObj);
        return features;    
    }
}

export default BigBedSource;
