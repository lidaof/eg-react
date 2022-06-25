import axios from "axios";
import _ from "lodash";
import WorkerRunnableSource from "../worker/WorkerRunnableSource";
import { ensureMaxListLength } from "../../util";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import makeBamIndex from "../../vendor/igv/BamIndex"; // This dependency is from IGV
import unbgzf from "../../vendor/igv/bgzf";

if (process.env.NODE_ENV !== "test" && typeof window === "undefined") {
    self.importScripts("js/zlib_and_gzip.min.js"); // eslint-disable-line no-restricted-globals
    self.importScripts("js/encoding-indexes.js"); // eslint-disable-line no-restricted-globals
    self.importScripts("js/encoding.js"); // eslint-disable-line no-restricted-globals
} // else that script have better been included in a <script> tag!

const MAX_GZIP_BLOCK_SIZE = 1 << 16;
const DATA_FILTER_LIMIT_LENGTH = 300000;

/**
 * Perform a network request for binary data.
 *
 * @param {string} url - url from which to request data.
 * @param {Object} range - object with number keys `start` and `end`.  Range of bytes to request.
 * @return {Promise<ArrayBuffer>} Promise for binary data from the url
 */
async function requestBinary(url, range) {
    const options = {
        responseType: "arraybuffer",
    };
    if (range) {
        options.headers = { Range: `bytes=${range.start}-${range.end}` };
        // Hack to prevent caching for byte-ranges. Attempt to fix net:err-cache errors in Chrome
        options.params = { someRandomSeed: Math.random().toString(36) };
    }
    const response = await axios.get(url, options);
    return response.data;
}

/**
 * A DataSource that gets BedRecords from remote bed files.  Designed to run in webworker context.  Only indexed bed
 * files supported.
 *
 * @author Silas Hsu
 */
class BedSourceWorker extends WorkerRunnableSource {
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
        this.indexPromise = requestBinary(this.indexUrl).then((rawData) => {
            // rawData is an ArrayBuffer
            let decompressor = new self.Zlib.Gunzip(new Uint8Array(rawData)); // eslint-disable-line no-restricted-globals
            let decompressed = decompressor.decompress();
            return makeBamIndex(decompressed.buffer, true);
        });
        this.getDataForLocus = this.getDataForLocus.bind(this);
    }

    /**
     * Gets data for a list of chromosome intervals.
     *
     * @param {ChromosomeInterval[]} loci - genome coordinates
     * @return {Promise<BedRecord[]>} Promise for the data
     */
    async getData(loci) {
        let promises = loci.map(this.getDataForLocus);
        const dataForEachLocus = await Promise.all(promises);
        return _.flatten(dataForEachLocus);
    }

    /**
     * Gets data for a single chromosome interval.
     *
     * @param {ChromosomeInterval} loci - genome coordinates
     * @return {Promise<BedRecord[]>} Promise for the data
     */
    async getDataForLocus(locus) {
        const { chr, start, end } = locus;
        const index = await this.indexPromise;
        const refId = index.sequenceIndexMap[chr];
        const blocks = index.blocksForRange(refId, start, end);
        if (!blocks) {
            return [];
        }

        let featuresForEachBlock = [];
        for (let block of blocks) {
            const startByte = block.minv.block;
            const startOffset = block.minv.offset;
            const endByte = block.maxv.block + MAX_GZIP_BLOCK_SIZE;

            const rawData = await requestBinary(this.url, { start: startByte, end: endByte });
            const uncompressed = unbgzf(rawData);
            const slicedData = startOffset > 0 ? uncompressed.slice(startOffset) : uncompressed;
            featuresForEachBlock.push(this._parseAndFilterFeatures(slicedData, chr, start, end));
        }
        return _.flatten(featuresForEachBlock);
    }

    /**
     * The data initially comes in as a large, binary blob.  This decodes the blob into text, parses the features, and
     * filters out those features outside of the interval we want.
     *
     * @param {ArrayBuffer} buffer - raw blob of text from the bed-like file
     * @param {string} chromosome - the chromosome for which to fetch data
     * @param {number} start - the start base pair of the interval
     * @param {number} end - the end base pair of the interval
     */
    _parseAndFilterFeatures(buffer, chromosome, start, end) {
        const text = new TextDecoder("utf-8").decode(buffer);
        let lines;
        if (end - start > DATA_FILTER_LIMIT_LENGTH) {
            lines = ensureMaxListLength(text.split("\n"), this.dataLimit);
        } else {
            lines = text.split("\n");
        }
        let features = [];
        for (let line of lines) {
            const columns = line.split("\t");
            if (columns.length < 3) {
                continue;
            }
            if (columns[0] !== chromosome) {
                continue;
            }

            let feature = {
                chr: columns[0],
                start: Number.parseInt(columns[1], 10),
                end: Number.parseInt(columns[2], 10),
            };

            if (feature.start > end) {
                // This is correct as long as the features are sorted by start
                break;
            }
            if (feature.end >= start && feature.start <= end) {
                for (let i = 3; i < columns.length; i++) {
                    // Copy the rest of the columns to the feature
                    feature[i] = columns[i];
                }
                features.push(feature);
            }
        }

        return features;
    }
}

export default BedSourceWorker;
