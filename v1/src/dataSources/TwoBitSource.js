import DataSource from './DataSource';

const twoBit = require('../vendor/bbi-js/main/twoBit');
const bin = require('../vendor/bbi-js/utils/bin');

/**
 * Reads and gets data from .2bit files hosted remotely.
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
     * Gets sequence stored in a single chromosome interval.
     * 
     * @param {ChromosomeInterval} interval - coordinates
     * @param {Twobit} twoBitObj 
     * @return {Promise} - a Promise for the data, 
     */
    _getSeqForChromosome(interval, twoBitObj) {
        return new Promise((resolve, reject) => {
            twoBitObj.fetch(interval.chr, ...interval, (data, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data)
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
        const twoBitObj = await this.twoBitPromise;
        const seq = await this._getSeqForChromosome(interval, twoBitObj);
        //console.log(seq);
        return seq;    
    }
}

export default TwoBitSource;
