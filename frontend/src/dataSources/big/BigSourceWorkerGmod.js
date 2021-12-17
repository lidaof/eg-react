import _ from "lodash";
import { BigWig } from "@gmod/bbi";
import { RemoteFile } from "generic-filehandle";
import { fetch } from "node-fetch";
import WorkerRunnableSource from "../worker/WorkerRunnableSource";

/**
 * Reads and gets data from bigwig or bigbed files hosted remotely using @gmod/bbi library
 *
 * @author Daofeng Li
 */
class BigSourceWorkerGmod extends WorkerRunnableSource {
    /**
     *
     * @param {string} url - the URL from which to fetch data
     */
    constructor(url) {
        super();
        this.url = url;
        this.bw = new BigWig({
            filehandle: new RemoteFile(url, { fetch }),
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
        // console.log(options);
        const promises = loci.map((locus) => {
            let chrom = options.ensemblStyle ? locus.chr.replace("chr", "") : locus.chr;
            if (chrom === "M") {
                chrom = "MT";
            }
            return this.bw.getFeatures(chrom, locus.start, locus.end);
        });
        const dataForEachLocus = await Promise.all(promises);
        loci.forEach((locus, index) => {
            dataForEachLocus[index].forEach((f) => (f.chr = locus.chr));
        });
        const combinedData = _.flatten(dataForEachLocus);
        // console.log(combinedData);
        return combinedData;
    }
}

export default BigSourceWorkerGmod;
