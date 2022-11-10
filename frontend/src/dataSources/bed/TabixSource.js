import _ from "lodash";
import { TabixIndexedFile } from "@gmod/tabix";
import { RemoteFile } from "generic-filehandle";
import { fetch } from "node-fetch";
import WorkerRunnableSource from "../worker/WorkerRunnableSource";
import { ensureMaxListLength } from "../../util";
// import ChromosomeInterval from "../../model/interval/ChromosomeInterval";

/**
 * A DataSource that gets BedRecords from remote bed files.  Designed to run in webworker context.  Only indexed bed
 * files supported.
 *
 * @author Daofeng Li based on Silas's version
 */
class TabixSource extends WorkerRunnableSource {
    /**
     * Prepares to fetch data from a bed file located at the input url.  Assumes the index is located at the same url,
     * plus a file extension of ".tbi".  This method will request and store the tabix index from this url immediately.
     *
     * @param {string} url - the url of the bed-like file to fetch.
     */
    constructor(url, indexUrl, dataLimit = 100000) {
        super();
        this.url = url;
        this.indexUrl = indexUrl ? indexUrl : url + ".tbi";
        this.dataLimit = dataLimit;
        this.tabix = new TabixIndexedFile({
            filehandle: new RemoteFile(url, { fetch }),
            tbiFilehandle: new RemoteFile(this.indexUrl, { fetch }),
        });
    }

    /**
     * Gets data for a list of chromosome intervals.
     *
     * @param {ChromosomeInterval[]} loci - locations for which to fetch data
     * @return {Promise<BedRecord[]>} Promise for the data
     */
    getData = async (loci, basesPerPixel, options) => {
        // let promises = loci.map(this.getDataForLocus);
        const promises = loci.map((locus) => {
            let chrom = options.ensemblStyle ? locus.chr.replace("chr", "") : locus.chr;
            if (chrom === "M") {
                chrom = "MT";
            }
            return this.getDataForLocus(chrom, locus.start, locus.end);
        });
        const dataForEachLocus = await Promise.all(promises);
        if (options.ensemblStyle) {
            loci.forEach((locus, index) => {
                dataForEachLocus[index].forEach((f) => (f.chr = locus.chr));
            });
        }
        return _.flatten(dataForEachLocus);
    };

    /**
     * Gets data for a single chromosome interval.
     *
     * @param {string} chr - genome coordinates
     * @param {number} start - genome coordinates
     * @param {stnumberring} end - genome coordinates
     * @return {Promise<BedRecord[]>} Promise for the data
     */
    getDataForLocus = async (chr, start, end) => {
        // const { chr, start, end } = locus;
        const rawlines = [];
        await this.tabix.getLines(chr, start, end, (line) => rawlines.push(line));
        let lines;
        if (rawlines.length > this.dataLimit) {
            lines = ensureMaxListLength(rawlines, this.dataLimit);
        } else {
            lines = rawlines;
        }
        return lines.map(this._parseLine);
    };

    /**
     * @param {string} line - raw string the bed-like file
     */
    _parseLine = (line) => {
        const columns = line.split("\t");
        if (columns.length < 3) {
            return;
        }
        let feature = {
            chr: columns[0],
            start: Number.parseInt(columns[1], 10),
            end: Number.parseInt(columns[2], 10),
        };
        for (let i = 3; i < columns.length; i++) {
            // Copy the rest of the columns to the feature
            feature[i] = columns[i];
        }
        return feature;
    };
}

export default TabixSource;
