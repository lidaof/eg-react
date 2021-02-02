import { reg2bin, reg2bins } from './binning';

/**
 * @author Daofeng Li
 * a indexer for genomic data
 */

class BinIndexer {
    constructor(dataArray, formatFunc, dataStartIndex = 0) {
        this.dataArray = dataArray;
        this.formatFunc = formatFunc;
        this.dataStartIndex = dataStartIndex;
        this.indexer = {};
    }

    /**
     * initialize the index with the input data and format function
     */
    init() {
        this.dataArray.forEach((item, itemIndex) => {
            if (itemIndex < this.dataStartIndex) {
                return;
            }
            const formatted = this.formatFunc(item);
            if (Array.isArray(formatted)) {
                formatted.forEach(record => this.put(record));
            } else {
                this.put(formatted);
            }
        });
    }

    /**
     * put record to indexer
     * @param {bedRecord} record
     */
    put(record) {
        if (!(record.chr && record.chr.length)) {
            return;
        }
        const binIndex = reg2bin(record.start, record.end);
        if (!this.indexer.hasOwnProperty(record.chr)) {
            this.indexer[record.chr] = {};
        }
        if (!this.indexer[record.chr].hasOwnProperty(binIndex)) {
            this.indexer[record.chr][binIndex] = [];
        }
        this.indexer[record.chr][binIndex].push(record);
    }

    /**
     * return records from the indexer using query from chromosome, start and end position
     * @param {string} chr
     * @param {number} start
     * @param {number} end
     */
    get(chr, start, end) {
        const result = [];
        if (!this.indexer.hasOwnProperty(chr)) {
            return result;
        }
        const indexes = reg2bins(start, end);
        for (const index of indexes) {
            if (this.indexer[chr].hasOwnProperty(index)) {
                this.indexer[chr][index].forEach(ele => result.push(ele));
            }
        }
        return result;
    }
}

export default BinIndexer;
