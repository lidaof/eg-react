import _ from 'lodash';
import DataSource from './DataSource';
import bam from '../vendor/bbi-js/main/bam';
import bin from '../vendor/bbi-js/utils/bin';

/*
BamRecord {
    MD: "27",
    NM: 0,
    XA: 0,
    cigar: "27M",
    flag: 0,
    mq: 255,
    pos: 18360643,
    quals: "IIIIIIIIIIIIIIIIIIIIIIIIIII",
    readName: "Sti_22947383",
    segment: "chr7",
    seq: "ATCGCCATTTTTGTAGGCTACGTATTT"
}
*/

class BamSource extends DataSource {
    constructor(url) {
        super();
        this.url = url;
        this.bamPromise = new Promise((resolve, reject) => {
            bam.makeBam(new bin.URLFetchable(url), new bin.URLFetchable(url + ".bai"), null, (reader, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(reader);
                }
            });
        });
    }

    async getData(region, basesPerPixel, options={}) {
        const bamObj = await this.bamPromise;
        let promises = region.getGenomeIntervals().map(locus => this._getDataInLocus(locus, bamObj));
        const dataForEachSegment = await Promise.all(promises);
        return _.flatten(dataForEachSegment);
    }

    _getDataInLocus(locus, bamObj) {
        return new Promise((resolve, reject) => {
            // bbi-js assumes coordinates are 1-indexed, while our coordinates are 0-indexed.  +1 to compensate.
            bamObj.fetch(locus.chr, locus.start + 1, locus.end, (data, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            })
        });
    }
}

export default BamSource;
