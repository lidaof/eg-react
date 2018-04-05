import DataSource from './DataSource';
import DataFormatter from './DataFormatter';
const bigwig = require('../vendor/bbi-js/main/bigwig');
const bin = require('../vendor/bbi-js/utils/bin');

/**
 * Reads and gets data from bigwig or bigbed files hosted remotely.  Gets DASFeature records, which vary in schema
 * depending on the file.
 * 
 * @author Silas Hsu
 */
export class BigWigOrBedSource extends DataSource {
    /**
     * Prepares to fetch bigwig or bigbed data from a URL.  Fetching data returns DASFeature, unless given some data
     * formatter.
     * 
     * @param {string} url - the URL from which to fetch data
     * @param {DataFormatter} [formatter] - converter of data to some other format
     */
    constructor(url, formatter=new DataFormatter()) {
        super();
        this.url = url;
        this.formatter = formatter;
        this.bigWigPromise = new Promise((resolve, reject) => {
            bigwig.makeBwg(new bin.URLFetchable(url), (bigWigObj, error) => {
                if (error) {
                    reject(error);
                }
                resolve(bigWigObj);
            });
        });
    }

    /**
     * Gets BigWig features inside the input view region.  Resolution is configured by `options`, or if missing, by
     * `window.innerWidth`.  Returns objects that fulfill the Interval interface, and have a `value` property as well.
     * 
     * @param {DisplayedRegionModel} region - the model containing the displayed region
     * @param {Object} [options] - object containing a `width` property used to determine fetch resolution
     * @return {Promise<Record[]>} a Promise for the data
     * @override
     */
    async getData(region, options={}) {
        const bigWigObj = await this.bigWigPromise;
        const basesPerPixel = region.getWidth() / (options.width || window.innerWidth + 1); // +1 to prevent 0
        const zoomLevel = this._getMatchingZoomLevel(bigWigObj, basesPerPixel);

        let promises = region.getGenomeIntervals().map(locus =>
            this._getDataForChromosome(locus, bigWigObj, zoomLevel)
        );
        const dataForEachSegment = await Promise.all(promises);
        const allData = [].concat.apply([], dataForEachSegment); // Combine all the data into one array
        return this.formatter.format(allData);
    }

    /**
     * BigWig files contain zoom levels, where data across many bases is aggregated into bins.  This selects an
     * appropriate zoom index from the BigWig file given the number of bases per pixel at which the data will be
     * visualized.  This function may also return -1, which indicates base pair resolution (no aggregation) is
     * appropriate.
     * 
     * @param {BigWig} bigWigObj - BigWig object provided by bbi-js
     * @param {number} basesPerPixel - bases per pixel to use to calculate an appropriate zoom level
     * @return {number} a zoom level index inside the BigWig file, or -1 if base pair resolution is appropriate.
     */
    _getMatchingZoomLevel(bigWigObj, basesPerPixel) {
        // Sort zoom levels from largest to smallest
        let sortedZoomLevels = bigWigObj.zoomLevels.slice().sort((levelA, levelB) => 
            levelB.reduction - levelA.reduction
        );
        let desiredZoom = sortedZoomLevels.find(zoomLevel => zoomLevel.reduction < basesPerPixel);
        return bigWigObj.zoomLevels.findIndex(zoomLevel => zoomLevel === desiredZoom);
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
        return new Promise((resolve, reject) => {
            try {
                if (zoomLevel === -1) {
                    bigWigObj.readWigData(interval.chr, ...interval, resolve);
                } else {
                    bigWigObj.getZoomedView(zoomLevel)
                        .readWigData(interval.chr, ...interval, resolve);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default BigWigOrBedSource;
