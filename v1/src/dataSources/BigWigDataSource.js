import BarChartRecord from '../model/BarChartRecord';
import DataSource from './DataSource';

const bigwig = require('../vendor/bbi-js/main/bigwig');
const bin = require('../vendor/bbi-js/utils/bin');

/**
 * Reads and gets data from BigWig files hosted remotely.
 * 
 * @author Silas Hsu
 */
class BigWigDataSource extends DataSource {
    /**
     * Prepares to fetch BigWig data from a URL.
     * 
     * @param {string} url - the URL from which to fetch data
     */
    constructor(url) {
        super();
        this.url = url;
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
     * Gets BigWig features inside the input view region.
     * 
     * @param {DisplayedRegionModel} region - the model containing the displayed region
     * @return {Promise<BarChartRecord[]>} a Promise for the data
     * @override
     */
    async getData(region) {
        let bigWigObj = await this.bigWigPromise;

        // FIXME window.innerWidth is not a good way to get pixelsPerBase, but it's quick and dirty.
        let basesPerPixel = region.getWidth() / window.innerWidth;
        let zoomLevel = this._getMatchingZoomLevel(bigWigObj, basesPerPixel);
        let promises = region.getRegionList().map(chromosome =>
            this._getDataForChromosome(chromosome, bigWigObj, zoomLevel)
        );
        let dataForEachRegion = await Promise.all(promises);
        let combinedData = [].concat.apply([], dataForEachRegion);
        return combinedData.map(dasFeature =>
            // dasFeature.segment should be a valid chromosome name, otherwise data fetch would have failed.
            new BarChartRecord(
                region.chromosomeCoordinatesToBase(dasFeature.segment, dasFeature.min),
                region.chromosomeCoordinatesToBase(dasFeature.segment, dasFeature.max),
                dasFeature.score
            )
        );
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

    /*
    interface DASFeature {
        max: number; // Chromosome base number, end
        maxScore: number;
        min: number; // Chromosome base number, start
        score: number; // Value at the location
        segment: string; // Chromosome name
        type: string;
        _chromId: number
    }
    */

    /**
     * Gets BigWig features stored in a single chromosome interval.
     * 
     * @param {SingleChromosomeInterval} region 
     * @param {BigWig} bigWigObj - BigWig object provided by bbi-js
     * @param {number} zoomLevel - a zoom level index inside the BigWig file.  If -1, gets data at base pair resolution.
     * @return {Promise<DASFeature[]>} - a Promise for the data, an array of DASFeature provided by bbi-js
     */
    _getDataForChromosome(region, bigWigObj, zoomLevel) {
        return new Promise((resolve, reject) => {
            try {
                if (zoomLevel === -1) {
                    bigWigObj.readWigData(region.name, region.start, region.end, resolve);
                } else {
                    bigWigObj.getZoomedView(zoomLevel).readWigData(region.name, region.start, region.end, resolve);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default BigWigDataSource;
