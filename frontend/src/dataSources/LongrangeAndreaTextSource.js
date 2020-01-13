import BedTextSource from './BedTextSource';
import BinIndexer from 'model/BinIndexer';

/**
 * @author Daofeng Li
 * get data from TextSource, index it and return by region querying
 */

class LongrangeAndreaTextSource extends BedTextSource {
    convertToBedRecord(item) {
        //"chr20:49368733-49369493<->chr20:50528173-50533850"	FALSE	FALSE	1161898.5	309	79.7857303792859
        const list = item[0].split(/\W+/);
        //> Array ["chr20", "49368733", "49369493", "chr20", "50528173", "50533850"]
        const record = {
            chr: list[0],
            start: Number.parseInt(list[1], 10),
            end: Number.parseInt(list[2], 10)
        };
        record[3] = `${list[3]}:${list[4]}-${list[5]},${item[5]}`;
        const record2 = {
            chr: list[3],
            start: Number.parseInt(list[4], 10),
            end: Number.parseInt(list[5], 10)
        };
        record2[3] = `${list[0]}:${list[1]}-${list[2]},${item[5]}`;
        return [record, record2];
    }

    initIndex() {
        this.indexer = new BinIndexer(this.textData.data, this.convertToBedRecord, 1);
    }
}

export default LongrangeAndreaTextSource;
