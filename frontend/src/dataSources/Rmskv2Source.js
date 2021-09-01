import DataSource from "./DataSource";
import WorkerSource from "./worker/WorkerSource";
import BigWorker from "./big/BigGmod.worker";

class Rmskv2Source extends DataSource {
    constructor(url, maxBasesPerPixel) {
        super();
        this.maxBasesPerPixel = maxBasesPerPixel;
        this.workerSource = new WorkerSource(BigWorker, url);
    }

    cleanUp() {
        this.workerSource.cleanUp();
    }

    getData(region, basesPerPixel, options) {
        if (basesPerPixel > this.maxBasesPerPixel) {
            return Promise.resolve([]);
        } else {
            return this.workerSource.getData(region, basesPerPixel, options);
        }
    }
}

export default Rmskv2Source;
