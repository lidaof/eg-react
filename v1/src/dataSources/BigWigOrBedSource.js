import DataSource from './DataSource';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';

const bigwig = require('../vendor/bbi-js/main/bigwig');
const bin = require('../vendor/bbi-js/utils/bin');

/**
 * Reads and gets data from BigWig files hosted remotely.
 * 
 * @author Silas Hsu
 */
class BigWigOrBedSource extends DataSource {
    /**
     * Prepares to fetch BigWig data from a URL.
     * 
     * @param {string} url - the URL from which to fetch data
     */
    constructor(url, dasFormatter=new DasFormatter()) {
        super();
        this.url = url;
        this.dasFormatter = dasFormatter;
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
     * @return {Promise<Object[]>} a Promise for the data
     * @override
     */
    async getData(region, options={}) {
        const bigWigObj = await this.bigWigPromise;

        const navContext = region.getNavigationContext();
        const basesPerPixel = region.getWidth() / (options.width || window.innerWidth + 1); // +1 to prevent 0
        const zoomLevel = this._getMatchingZoomLevel(bigWigObj, basesPerPixel);
        let promises = region.getFeatureIntervals().map(async featureInterval => {
            const chrInterval = featureInterval.getGenomeCoordinates();
            const dasFeatures = await this._getDataForChromosome(chrInterval, bigWigObj, zoomLevel);
            let result = [];
            for (let dasFeature of dasFeatures) {
                const formatted = this.dasFormatter.format(dasFeature, navContext, featureInterval.feature);
                if (formatted) {
                    result.push(formatted);
                }
            }
            return result;
        });
        let dataForEachSegment = await Promise.all(promises);
        return [].concat.apply([], dataForEachSegment); // Combine all the data into one array
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


class DasFormatter {
    /**
     * 
     * @param {DASFeature} dasFeature 
     * @param {NavigationContext} navContext 
     * @param {Feature} contextFeature 
     */
    format(dasFeature, navContext, contextFeature) {
        return dasFeature;
    }
}

/**
 * An object that fulfills the Interval interface with an additional prop `score` that stores the value at the
 * coordinate.  The interval is an open 0-indexed one.
 * 
 * @typedef {OpenInterval} BigWigSource~Record
 * @property {number} start - inclusive start of the interval
 * @property {number} end - exclusive end of the interval
 * @property {number} value - the value of this interval
 */

export class NumericalDasFormatter extends DasFormatter {

    format(dasFeature, navContext, contextFeature) {
        try { // ConvertGenomeIntervalToBases can throw RangeError.
            let absInterval = navContext.convertGenomeIntervalToBases(
                new ChromosomeInterval(dasFeature.segment, dasFeature.min, dasFeature.max), contextFeature
            );
            absInterval.value = dasFeature.score;
            return absInterval
        } catch (error) { // Ignore RangeErrors; let others bubble up.
            if (!(error instanceof RangeError)) {
                throw error;
            }
        }
    }
}

export class RepeatDasFormatter extends DasFormatter {
    
}
