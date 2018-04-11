import PromiseWorker from 'promise-worker';
import BedWorker from './Bed.worker';
import DataSource from './DataSource';
import DataFormatter from './DataFormatter';

/**
 * A DataSource that gets annotations from bed files (and derivatives, like bedGraph).  Only indexed files supported.
 * Without any data formatting, gets BedRecords.  See {@link BedRecord.ts}.
 * 
 * Be sure to call cleanUp() with this data source, as it spawns a web worker that needs manual termination.
 * 
 * @author Silas Hsu
 */
class BedSource extends DataSource {
    /**
     * Makes a new instance specialized to serve data from a url.  Fetching data will return BedRecords by default,
     * unless given a BedFormatter.
     * 
     * @param {string} url - the url from which to fetch data
     * @param {DataFormatter} [bedFormatter] - converter from BedRecords to some other format
     */
    constructor(url, bedFormatter=new DataFormatter()) {
        super();
        this.formatter = bedFormatter;
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

        let promises = region.getGenomeIntervals().map(locus =>
            this.worker.postMessage({region: locus})
        );
        const dataForEachSegment = await Promise.all(promises);
        const allData = [].concat.apply([], dataForEachSegment);
        return this.formatter.format(allData);
    }
}

export default BedSource;
