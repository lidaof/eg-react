import _ from 'lodash';
import DataSource from './DataSource';
import TextSource from './TextSource';
import { reg2bin, reg2bins } from '../model/binning';

class BedTextSource extends DataSource {
    constructor(config) {
        super();
        this.source = new TextSource(config);
    }

    indexData(data) {
        const bin = {};
        data.forEach(item => {
            const record = {
                chr: item[0],
                start: Number.parseInt(item[1], 10),
                end: Number.parseInt(item[2], 10)
            };
            for (let i = 3; i < item.length; i++) {
                record[i] = item[i];
            }
            const binIndex = reg2bin(record.start, record.end);
            if (!bin.hasOwnProperty(record.chr)) {
                bin[record.chr] = {};
            }
            if (!bin[record.chr].hasOwnProperty(binIndex)) {
                bin[record.chr][binIndex] = [];
            }
            bin[record.chr][binIndex].push(record);
        });
        return bin;
    }

    async getData(region) {
        const textData = await this.source.init();
        const trackData = this.indexData(textData.data);
        const loci = region.getGenomeIntervals();
        const data = loci.map(locus => {
            const result = [];
            if (!trackData.hasOwnProperty(locus.chr)) {
                return result;
            }
            const indexes = reg2bins(locus.start, locus.end);
            for (const index of indexes) {
                if (trackData[locus.chr].hasOwnProperty(index)) {
                    trackData[locus.chr][index].forEach(ele => result.push(ele));
                }
            }
            return result;
        });
        return _.flatten(data);
    }
}

export default BedTextSource;
