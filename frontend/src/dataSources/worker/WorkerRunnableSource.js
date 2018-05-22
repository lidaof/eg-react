/**
 * A source of data that webworkers can run.  A little different than DataSource because of the data serialization
 * involved with webworkers.
 */
class WorkerRunnableSource {
    /**
     * Gets data in the genomic regions.
     * 
     * @param {ChromosomeInterval[]} loci - locations for which to fetch data
     * @param {number} pixelsPerBase - pixels per base, or resolution of the data
     * @param {Object} options - rendering options
     * @return {Promise<any>} a Promise for the data
     */
    getData() {

    }
}

export default WorkerRunnableSource;
