import _ from "lodash";
import { BAllC } from "./BAllC";
import { RemoteFile } from "generic-filehandle";
import { fetch } from "node-fetch";
import WorkerRunnableSource from "../worker/WorkerRunnableSource";

/**
 * Reads and gets data from remotely-hosted .ballc files.
 *
 * @author Daofeng Li
 */
class BallcSource extends WorkerRunnableSource {
    /**
     * Prepares to fetch .ballc data from a URL.
     *
     * @param {string} url - the URL from which to fetch data
     */
    constructor(url) {
        super();
        this.url = url;
        this.ballc = new BAllC(new RemoteFile(url, { fetch }), new RemoteFile(`${url}.bci`, { fetch }));
    }

    /**
     * Gets the sequence that covers the region.
     *
     * @param {DisplayedRegionModel} region - region for which to fetch data
     * @return {Promise<SequenceData[]>} - sequence in the region
     */
    async getData(loci, basesPerPixel, options) {
        const promises = loci.map(async (locus) => {
            let chrom = options && options.ensemblStyle ? locus.chr.replace("chr", "") : locus.chr;
            if (chrom === "M") {
                chrom = "MT";
            }
            // console.log(`fetching ${chrom}:${locus.start}-${locus.end}`);
            return await this.ballc.query(`${chrom}:${locus.start}-${locus.end}`);
        });
        const dataForEachLocus = await Promise.all(promises);
        return _.flatten(dataForEachLocus);
    }
}

export default BallcSource;
