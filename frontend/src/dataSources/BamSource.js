import _ from "lodash";
import DataSource from "./DataSource";
// import bam from '../vendor/bbi-js/main/bam';
// import bin from '../vendor/bbi-js/utils/bin';
import { BamFile } from "@gmod/bam";
import { BlobFile } from "generic-filehandle";

/**
 * Daofeng switched to use @gmod/bam instead
 */

class BamSource extends DataSource {
    constructor(param) {
        // is param is string, it's a url, otherwise a File Obj array
        super();
        this.bam = null;
        // this.bamPromise = new Promise((resolve, reject) => {
        //     bam.makeBam(new bin.URLFetchable(url), new bin.URLFetchable(url + ".bai"), null, (reader, error) => {
        //         if (error) {
        //             reject(error);
        //         } else {
        //             resolve(reader);
        //         }
        //     });
        // });
        if (typeof param === "string") {
            this.bam = new BamFile({
                bamUrl: param,
                baiUrl: param + ".bai",
            });
        } else {
            const baiFilehandle = new BlobFile(param.filter((f) => f.name.endsWith(".bai"))[0]);
            const bamFilehandle = new BlobFile(param.filter((f) => !f.name.endsWith(".bai"))[0]);
            this.bam = new BamFile({
                bamFilehandle,
                baiFilehandle,
            });
        }
        // console.log(this.bam);
        this.header = null;
    }

    async getData(region, basesPerPixel, options = {}) {
        // const bamObj = await this.bamPromise;
        // let promises = region.getGenomeIntervals().map(locus => this._getDataInLocus(locus, bamObj));
        if (!this.header) {
            this.header = await this.bam.getHeader();
        }
        const promises = region
            .getGenomeIntervals()
            .map((locus) => this.bam.getRecordsForRange(locus.chr, locus.start, locus.end));
        const dataForEachSegment = await Promise.all(promises);
        // console.log(dataForEachSegment)
        const flattened = _.flatten(dataForEachSegment);
        const alignments = flattened.map((r) =>
            Object.assign(r, { ref: this.bam.indexToChr[r.get("seq_id")].refName })
        );
        return alignments;
    }

    // _getDataInLocus(locus, bamObj) {
    //     return new Promise((resolve, reject) => {
    //         // bbi-js assumes coordinates are 1-indexed, while our coordinates are 0-indexed.  +1 to compensate.
    //         bamObj.fetch(locus.chr, locus.start + 1, locus.end, (data, error) => {
    //             if (error) {
    //                 reject(error);
    //             } else {
    //                 resolve(data);
    //             }
    //         })
    //     });
    // }
}

export default BamSource;
