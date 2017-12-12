import DataSource from './DataSource';
const PromiseWorker = require('promise-worker');
const FeatureWorker = require('./Feature.worker');

/**
 * A DataSource that gets annotations from bed files (and derivatives, like hammock).  Spawns a web worker that unzips
 * and parses remotely hosted files.  Only indexed files supported.
 */
class FeatureSource extends DataSource {
    /**
     * Makes a new FeatureSource and spawns a webworker.
     * 
     * @param {string} url 
     */
    constructor(url) {
        super();
        this.worker = new PromiseWorker(new FeatureWorker());
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
     * @inheritdoc
     */
    getData(region) {
        if (!this.worker) {
            throw new Error("Cannot get data -- cleanUp() has been called.");
        }
        return this.worker.postMessage({regions: region.getRegionList()});
    }
}

export default FeatureSource;
