import DataSource from './DataSource';
const PromiseWorker = require('promise-worker');
const BedWorker = require('./Bed.worker');

/**
 * A DataSource that gets annotations from bed files (and derivatives, like hammock).  Spawns a web worker that unzips
 * and parses remotely hosted files.  Only indexed files supported.
 */
class BedSource extends DataSource {
    /**
     * Makes a new BedSource specialized to serve data from a url.  Fetching data will return BedRecords by default,
     * unless given a BedFormatter.
     * 
     * @param {string} url - the url from which to fetch data
     * @param {BedFormatter} [bedFormatter] - converter from BedRecords to some other format
     */
    constructor(url, bedFormatter) {
        super();
        this.bedFormatter = bedFormatter;
        this.worker = new PromiseWorker(new BedWorker());
        this.worker.postMessage({url: url});
    }

    /**
     * Terminates the associated web worker.  Further calls to getData will cause an error.
     * 
     * @override
     */
    cleanUp() {
        this.worker._worker.terminate();
        this.worker = null;
    }

    /**
     * Gets data lying within the region.  Returns a promise for an array of data.
     * 
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @param {Object} [options] - data fetching options
     * @return {Promise<Object[]>} promise for data
     * @override
     */
    async getData(region, options) {
        if (!this.worker) {
            throw new Error("Cannot get data -- cleanUp() has been called.");
        }

        const navContext = region.getNavigationContext();
        let promises = region.getSegmentIntervals().map(async segment => {
            const chrInterval = navContext.mapToGenome(segment);
            const bedRecords = await this.worker.postMessage({region: chrInterval});
            if (this.bedFormatter) {
                return this.bedFormatter.format(bedRecords, region, segment);
            } else {
                return bedRecords;
            }
        });

        const dataForEachSegment = await Promise.all(promises);
        return [].concat.apply([], dataForEachSegment);
    }
}

export default BedSource;
