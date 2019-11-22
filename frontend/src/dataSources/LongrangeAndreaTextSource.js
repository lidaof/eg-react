import _ from "lodash";
import DataSource from "./DataSource";
import TextSource from "./TextSource";
import { reg2bin, reg2bins } from "../model/binning";

/**
 * @author Daofeng Li
 * get data from TextSource, index it and return by region querying
 */

class LongrangeAndreaTextSource extends DataSource {
  constructor(config) {
    super();
    this.source = new TextSource(config);
  }

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
    return record;
  }

  indexData(data) {
    const bin = {};
    data.forEach((item, itemIndex) => {
      if (itemIndex < 1) {
        return;
      }
      const record = this.convertToBedRecord(item);
      if (!record.chr.length) {
        return;
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

export default LongrangeAndreaTextSource;
