import PromiseWorker from 'promise-worker';
import DataSource from '../DataSource';
import { MessageWriter } from './WorkerMessage';

class WorkerManager {
    constructor() {
        this.workerClassToInstance = new Map();
    }

    getInstance(WorkerClass) {
        let instance = this.workerClassToInstance.get(WorkerClass);
        if (!instance) {
            instance = new PromiseWorker(new WorkerClass());
            this.workerClassToInstance.set(WorkerClass, instance);
        }
        return instance;
    }
}
const WORKER_MANAGER = new WorkerManager();

class WorkerSource extends DataSource {
    /**
     * Makes a new instance.
     * 
     * @param {typeof Worker} WorkerClass
     * @param {...any} args
     */
    constructor(WorkerClass, ...args) {
        super();
        const worker = WORKER_MANAGER.getInstance(WorkerClass);
        this.messageWriter = new MessageWriter(worker);
        this.messageWriter.sendInitMessage(...args);
    }

    /**
     * @inheritdoc
     */
    cleanUp() {
        this.messageWriter.sendDeleteMessage();
        this.messageWriter = null;
    }

    /**
     * Gets data in the view region.  The return type depends on the webworker passed in the constructor.  Note that
     * objects lose their prototypes when transferred from worker context.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {number} pixelsPerBase - pixels per base, or resolution of the data
     * @param {Object} options - rendering options
     * @return {Promise<any>} promise for data
     * @override
     */
    getData(region, pixelsPerBase, options={}) {
        if (!this.messageWriter) {
            throw new Error("Cannot get data after cleanUp()");
        }
        return this.messageWriter.sendGetDataMessage(region, pixelsPerBase, options);
    }
}

export default WorkerSource;
