import _ from "lodash";
import WorkerRunnableSource from "../worker/WorkerRunnableSource";
import bigwig from "../../vendor/bbi-js/main/bigwig";
import bin from "../../vendor/bbi-js/utils/bin";
import { BigWigZoomLevels } from "model/DisplayModes";

/**
 * Reads and gets data from bigwig or bigbed files hosted remotely.  Gets DASFeature records, which vary in schema
 * depending on the file.
 *
 * @author Silas Hsu
 */
class BigSourceWorker extends WorkerRunnableSource {
    /**
     * Prepares to fetch bigwig or bigbed data from a URL.
     *
     * @param {string} url - the URL from which to fetch data
     */
    constructor(url) {
        super();
        this.url = url;
        const opts = {credentials: this.url.includes('4dnucleome') ? process.env.REACT_APP_4DN_KEY : undefined}
        this.bigWigPromise = new Promise((resolve, reject) => {
            bigwig.makeBwg(new bin.URLFetchable(url, opts), (bigWigObj, error) => {
                if (error) {
                    reject(error);
                }
                resolve(bigWigObj);
            });
        });
    }

    /**
     * Gets BigWig or BigBed features inside the requested locations.
     *
     * @param {ChromosomeInterval[]} loci - locations for which to fetch data
     * @param {number} [basesPerPixel] - used to determine fetch resolution
     * @return {Promise<DASFeature[]>} a Promise for the data
     * @override
     */
    async getData(loci, basesPerPixel, options) {
        const bigWigObj = await this.bigWigPromise;
        const zoomLevel =
            options.zoomLevel === undefined || options.zoomLevel === BigWigZoomLevels.AUTO
                ? this._getMatchingZoomLevel(bigWigObj, basesPerPixel)
                : Number.parseInt(options.zoomLevel);
        // console.log(bigWigObj, basesPerPixel, zoomLevel);
        let promises = loci.map((locus) => this._getDataForChromosome(locus, bigWigObj, zoomLevel));
        const dataForEachLocus = await Promise.all(promises);
        const combinedData = _.flatten(dataForEachLocus);
        for (let dasFeature of combinedData) {
            dasFeature.min -= 1; // bbi-js returns 1-indexed features; -1 to compensate.
        }
        return combinedData;
    }

    /**
     * BigWig files contain zoom levels, where data across many bases is aggregated into bins.  This selects an
     * appropriate zoom index from the BigWig file given the number of bases per pixel at which the data will be
     * visualized.  This function may also return -1, which indicates base pair resolution (no aggregation) is
     * appropriate.
     *
     * @param {BigWig} bigWigObj - BigWig object provided by bbi-js
     * @param {number} [basesPerPixel] - bases per pixel to use to calculate an appropriate zoom level
     * @return {number} a zoom level index inside the BigWig file, or -1 if base pair resolution is appropriate.
     */
    _getMatchingZoomLevel(bigWigObj, basesPerPixel) {
        if (!basesPerPixel) {
            return -1;
        }
        if (bigWigObj.zoomLevels.length === 1) {
            // just one zoom level
            return 0;
        }
        // Sort zoom levels from largest to smallest
        let sortedZoomLevels = bigWigObj.zoomLevels
            .slice()
            .sort((levelA, levelB) => levelB.reduction - levelA.reduction);
        let desiredZoom = sortedZoomLevels.find((zoomLevel) => zoomLevel.reduction < basesPerPixel);
        return bigWigObj.zoomLevels.findIndex((zoomLevel) => zoomLevel === desiredZoom);
    }

    /**
     * Gets BigWig features stored in a single chromosome interval.
     *
     * @param {ChromosomeInterval} interval - coordinates
     * @param {BigWig} bigWigObj - BigWig object provided by bbi-js
     * @param {number} zoomLevel - a zoom level index inside the BigWig file.  If -1, gets data at base pair resolution.
     * @return {Promise<DASFeature[]>} - a Promise for the data, an array of DASFeature provided by bbi-js
     */
    _getDataForChromosome(interval, bigWigObj, zoomLevel) {
        // bbi-js assumes coordinates are 1-indexed, while our coordinates are 0-indexed.  +1 to compensate.
        const start = interval.start + 1;
        const end = interval.end;
        return new Promise((resolve, reject) => {
            try {
                if (zoomLevel === -1) {
                    bigWigObj.readWigData(interval.chr, start, end, resolve);
                } else {
                    bigWigObj.getZoomedView(zoomLevel).readWigData(interval.chr, start, end, resolve);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default BigSourceWorker;
