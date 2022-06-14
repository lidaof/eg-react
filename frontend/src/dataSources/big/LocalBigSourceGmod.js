import _ from "lodash";
import { BigWig } from "@gmod/bbi";
import FrontendLocalFile from '../FrontendLocalFile';
// import { BlobFile, LocalFile, RemoteFile } from "generic-filehandle";
import { LocalFile, RemoteFile, open, BlobFile } from "generic-filehandle";
import DataSource from "../DataSource";
import { string } from "prop-types";
import JSON5 from "json5";
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
    constructor(path) {
        super();
        // this.blob = blob;
        console.log(path);
        // console.log(window.fs.readFile('/home/repos/Test_Tracks/testFile.txt', { encoding: 'utf8' }));
        console.log(new FrontendLocalFile(path));
        // console.log(new RemoteFile(blob.path, { fetch: window.remoteFetch }));
        // const test = new window.localfile(path);
        // console.log(window.gfh, window.versions);
        // console.log(window.nodeGFH, window.nodeGFH.createLocalBWFile(path), JSON5.parse(window.nodeGFH.createLocalBWFile(path)), window.versions);
        // console.log(window.nodeGFH);
        // console.log(window.nodeGFH.createLocalFile(path), JSON.parse(window.nodeGFH.createLocalFile(path)));
        // this.blob = blob;
        console.log(new BigWig({ filehandle: new BlobFile(path) }));
        console.log(new BigWig({ filehandle: new FrontendLocalFile(path.path) }));
        this.bw = new BigWig({
            // filehandle: new BlobFile(path),
            // filehandle: new window.gfh.LocalFile(path),
            // filehandle: JSON.parse(window.nodeGFH.createLocalFile(path)),
            filehandle: new FrontendLocalFile(path.path),
            // path: new RemoteFile(blob.path, { fetch: window.remoteFetch }),
            // path: blob.path,
        });
        // this.bw = JSON5.parse(window.nodeGFH.createLocalBWFile(path));
        console.log(this.bw);
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

export default LocalBigSourceGmod;