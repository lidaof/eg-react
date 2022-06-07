import DataSource from "./DataSource";
import WorkerSource from "./worker/WorkerSource";
import { BigGmodWorker } from "./WorkerTSHook";
import LocalBigSourceGmod from "./big/LocalBigSourceGmod";

class JasparSource extends DataSource {
    constructor(trackModel, maxBasesPerPixel) {
        super();
        this.maxBasesPerPixel = maxBasesPerPixel;
        this.workerSource = null;
        if (trackModel.fileObj) {
            this.workerSource = new LocalBigSourceGmod(trackModel.fileObj);
        } else {
            this.workerSource = new WorkerSource(BigGmodWorker, trackModel.url);
        }
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

export default JasparSource;
