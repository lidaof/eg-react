import registerPromiseWorker from 'promise-worker/register';
import { MessageReader } from './WorkerMessage';

/**
 * Registers a data source class so it can instantiated and run in webworker context, presumably by WorkerSource.
 * 
 * @param {typeof WorkerRunnableSource} DataSourceType - the class to instantiate and run from another thread
 */
function registerWorkerRunnableSource(DataSourceType) {
    const clientManager = new ClientManager(DataSourceType); // Allows multiple data sources in one worker
    const messageReader = new MessageReader();
    // Specified by promise-worker (https://github.com/nolanlawson/promise-worker#message-format).
    registerPromiseWorker(message => {
        return messageReader.handleMessage(message, clientManager);
    });
}

class ClientManager {
    /**
     * @param {typeof WorkerRunnableSource} DataSourceType 
     */
    constructor(DataSourceType) {
        this.DataSourceType = DataSourceType;
        this.sourceForClientId = new AutoKeyMap();
    }

    initSource(args) {
        const newSource = new this.DataSourceType(...args);
        return this.sourceForClientId.insert(newSource);
    }

    runSource(clientId, args) {
        const source = this.sourceForClientId.get(clientId);
        return source.getData(...args);
    }

    removeSource(clientId) {
        this.sourceForClientId.delete(clientId);
    }
}

class AutoKeyMap {
    constructor() {
        this.map = {};
        this.nextKey = 0;
    }

    insert(value) {
        const key = this.nextKey;
        this.map[key] = value;
        this.nextKey++;
        return key;
    }

    get(key) {
        return this.map[key];
    }

    delete(key) {
        delete this.map[key];
    }
}

export default registerWorkerRunnableSource;
