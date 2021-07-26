import _ from "lodash";
import { BigWig } from "@gmod/bbi";
import { BlobFile } from "generic-filehandle";
import DataSource from "../DataSource";
/**
 * Reads and gets data from bigwig or bigbed files hosted remotely using @gmod/bbi library
 *
 * @author Daofeng Li
 */
class LocalBigSourceGmod extends DataSource {
    /**
     *
     * @param {string} url - the URL from which to fetch data
     */
    constructor(blob) {
        super();
        this.blob = blob;
        // console.log(this.blob);
        this.bw = new BigWig({
            filehandle: new BlobFile(blob),
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
    async getData(region, basesPerPixel, options) {
        const loci = region.getGenomeIntervals();
        const promises = loci.map((locus) => this.bw.getFeatures(locus.chr, locus.start, locus.end));
        const dataForEachLocus = await Promise.all(promises);
        loci.forEach((locus, index) => {
            dataForEachLocus[index].forEach((f) => (f.chr = locus.chr));
        });
        const combinedData = _.flatten(dataForEachLocus);
        // console.log(combinedData);
        return combinedData;
    }
}

export default LocalBigSourceGmod;
