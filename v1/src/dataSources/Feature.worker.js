import DisplayedRegionModel from '../model/DisplayedRegionModel';
import makeBamIndex from '../vendor/igv/BamIndex';
import unbgzf from '../vendor/igv/bgzf';

if (process.env.NODE_ENV !== "test") {
    importScripts('js/zlib_and_gzip.min.js');
}
const registerPromiseWorker = require('promise-worker/register');

var theWorker = null;

const MAX_GZIP_BLOCK_SIZE = 1 << 16;

function requestBinary(url, range) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
        xhr.onload = (event) => resolve(xhr.response);
        xhr.open('GET', url);
        if (range) {
            xhr.setRequestHeader("Range", `bytes=${range.start}-${range.end}`);
        }
        xhr.send();
    });
}

class FeatureSourceWorker {
    constructor(url) {
        this.url = url;
        this.indexPromise = requestBinary(url + '.tbi').then((rawData) => { // rawData is an ArrayBuffer
            let decompressor = new Zlib.Gunzip(new Uint8Array(rawData));
            let decompressed = decompressor.decompress();
            return makeBamIndex(decompressed.buffer, true);
        });
    }

    async getData(region) {
        if (!region) {
            return [];
        }

        await this.indexPromise;

        const getRegionList = DisplayedRegionModel.prototype.getRegionList.bind(region);
        let requests = [];
        for (let chrInterval of getRegionList()) {
            requests.push(this._getFeatures(chrInterval.name, chrInterval.start, chrInterval.end));
        }

        // Concatenate all the data into one array
        return Promise.all(requests).then(results => [].concat.apply([], results));
    }

    async _getFeatures(chromosome, start, end) {
        const index = await this.indexPromise;
        const refId = index.sequenceIndexMap[chromosome];
        const blocks = index.blocksForRange(refId, start, end);
        if (!blocks) {
            return [];
        }

        let featuresForEachBlock = [];
        for (let block of blocks) {
            const startByte = block.minv.block;
            const startOffset = block.minv.offset;
            const endByte = block.maxv.block + MAX_GZIP_BLOCK_SIZE;

            const rawData = await requestBinary(this.url, {start: startByte, end: endByte});
            const uncompressed = unbgzf(rawData);
            const slicedData = startOffset > 0 ? uncompressed.slice(startOffset) : uncompressed;
            featuresForEachBlock.push(this._parseAndFilterFeatures(slicedData, chromosome, start, end));
        }
        return [].concat.apply([], featuresForEachBlock); // Combine all of the features into one array
    }

    _parseAndFilterFeatures(buffer, chromosome, start, end) {
        const text = new TextDecoder('utf-8').decode(buffer);
        const lines = text.split('\n');

        let features = [];
        for (let line of lines) {
            const columns = line.split('\t');
            if (columns.length < 4) {
                continue;
            }
            if (columns[0] !== chromosome) {
                continue;
            }
            
            const feature = {
                chr: columns[0],
                start: Number.parseInt(columns[1]),
                end: Number.parseInt(columns[2]),
                details: columns[3]
            }
            if (feature.start > end) {
                break;
            }
            if (feature.end >= start && feature.start <= end) {
                features.push(feature);
            }
        }

        return features;
    }
}

registerPromiseWorker((args) => {
    if (args.url) {
        theWorker = new FeatureSourceWorker(args.url);
    }

    return theWorker.getData(args.region);
});
