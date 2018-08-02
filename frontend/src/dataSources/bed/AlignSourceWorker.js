import JSON5 from 'json5';
import BedSourceWorker from './BedSourceWorker';
import WorkerRunnableSource from '../worker/WorkerRunnableSource';

export class AlignSourceWorker extends WorkerRunnableSource {
    constructor(url) {
        super();
        this.bedSourceWorker = new BedSourceWorker(url, Infinity);
    }

    async getData(loci, basesPerPixel, options={}) {
        const bedRecords = await this.bedSourceWorker.getData(loci);
        bedRecords.map(record => {
            let data = JSON5.parse('{' + record[3] + '}');
            if (options.isRoughMode) {
                data.genomealign.targetseq = null;
                data.genomealign.queryseq = null;
            }
            record[3] = data;
        });
        return bedRecords;
    }
}
