import BedSourceWorker from './BedSourceWorker';
import WorkerRunnableSource from '../worker/WorkerRunnableSource';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import { GenomeInteraction } from '../../model/GenomeInteraction';

export class LongRangeSourceWorker extends WorkerRunnableSource {
    constructor(url) {
        super();
        this.bedSourceWorker = new BedSourceWorker(url, Infinity);
    }

    async getData(loci, basesPerPixel, options={}) {
        const bedRecords = await this.bedSourceWorker.getData(loci);
        const interactions = [];
        bedRecords.forEach(record => {
            const regexMatch = record[3].match(/(\w+)\W+(\d+)\W+(\d+)\W+(\d+)/);
            if (regexMatch) {
                const chr = regexMatch[1];
                const start = Number.parseInt(regexMatch[2], 10);
                const end = Number.parseInt(regexMatch[3], 10);
                const score = Number.parseFloat(regexMatch[4]);
                const recordLocus1 = new ChromosomeInterval(record.chr, record.start, record.end);
                const recordLocus2 = new ChromosomeInterval(chr, start, end);
                interactions.push(new GenomeInteraction(recordLocus1, recordLocus2, score));
            } else {
                console.error(`${record[3]} not formated correctly in longrange track`);
            }
        });
        return interactions;
    }
}
