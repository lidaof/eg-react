import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

const Actions = {
    INIT: 0,
    RUN: 1,
    DELETE: 2,
};

export class MessageWriter {
    constructor(worker) {
        this.worker = worker;
        this.clientIdPromise = null;
    }

    sendInitMessage(...args) {
        this.clientIdPromise = this.worker.postMessage({
            action: Actions.INIT,
            args: args
        });
        return this.clientIdPromise;
    }

    async sendGetDataMessage(region, pixelsPerBase, options) {
        const clientId = await this.clientIdPromise;
        const loci = region.getGenomeIntervals().map(locus => locus.serialize());
        return this.worker.postMessage({
            action: Actions.RUN,
            clientId: clientId,
            loci: loci,
            pixelsPerBase: pixelsPerBase,
            options: options,
        });
    }
    
    async sendDeleteMessage() {
        const clientId = await this.clientIdPromise;
        return this.worker.postMessage({
            action: Actions.DELETE,
            clientId: clientId
        });
    }
}

export class MessageReader {
    handleMessage(message, manager) {
        switch (message.action) {
            case Actions.INIT:
                return manager.initSource(message.args);
            case Actions.RUN:
                const loci = message.loci.map(ChromosomeInterval.deserialize);
                return manager.runSource(message.clientId, [loci, message.pixelsPerBase, message.options]);
            case Actions.DELETE:
                return manager.removeSource(message.clientId);
            default:
                throw new Error(`Unknown action ${message.action}`);
        }
    }
}
