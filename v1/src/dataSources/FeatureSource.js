import DataSource from './DataSource';
const PromiseWorker = require('promise-worker');
const FeatureWorker = require('./Feature.worker');

class FeatureSource extends DataSource {
    constructor(url, isIndexed=true) {
        super();
        this.worker = new PromiseWorker(new FeatureWorker());
        this.worker.postMessage({url: url});
    }

    cleanUp() {
        this.worker._worker.terminate();
        this.worker = null;
    }

    getData(region) {
        return this.worker.postMessage({region: region});
    }
}

export default FeatureSource;
