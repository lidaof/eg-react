import DataSource from './DataSource';
const PromiseWorker = require('promise-worker');
const BedWorker = require('./Bed.worker');

/**
 * A DataSource that gets annotations from bed files (and derivatives, like hammock).  Spawns a web worker that unzips
 * and parses remotely hosted files.  Only indexed files supported.
 */
class BedSource extends DataSource {
    /**
     * Makes a new BedSource and spawns a webworker.
     * 
     * @param {string} url 
     */
    constructor(url) {
        super();
        this.worker = new PromiseWorker(new BedWorker());
        this.worker.postMessage({url: url});
    }

    /**
     * Terminates the associated web worker.  Further calls to getData will cause an error.
     */
    cleanUp() {
        this.worker._worker.terminate();
        this.worker = null;
    }

    /**
     * Gets data lying within the region.  Returns a promise for an array of BedRecords.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @return {Promise<BedRecord[]>} promise for data
     * @override
     */
    getData(region) {
        if (!this.worker) {
            throw new Error("Cannot get data -- cleanUp() has been called.");
        }
        return this.worker.postMessage({regions: region.getGenomeIntervals()});
    }
}

export default BedSource;
