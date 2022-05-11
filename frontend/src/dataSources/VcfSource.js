import _ from "lodash";
import { BlobFile, RemoteFile } from "generic-filehandle";
import { TabixIndexedFile } from "@gmod/tabix";
import VCF from "@gmod/vcf";
import DataSource from "./DataSource";

class VcfSource extends DataSource {
    constructor(url, indexUrl) {
        // is param is string, it's a url, otherwise a File Obj array
        super();
        let filehandle, tbiFilehandle;
        if (Array.isArray(url)) {
            filehandle = new BlobFile(url.filter((f) => !f.name.endsWith(".tbi"))[0]);
            tbiFilehandle = new BlobFile(url.filter((f) => f.name.endsWith(".tbi"))[0]);
        } else {
            filehandle = new RemoteFile(url);
            tbiFilehandle = new RemoteFile(indexUrl ? indexUrl : url + ".tbi");
        }
        this.vcf = new TabixIndexedFile({ filehandle, tbiFilehandle });
        // console.log(this.vcf);
        this.header = null;
        this.parser = null;
    }

    async getData(region, basesPerPixel, options) {
        if (!this.header) {
            this.header = await this.vcf.getHeader();
        }
        if (!this.parser) {
            this.parser = new VCF({ header: this.header });
        }
        const promises = region.getGenomeIntervals().map((locus) => this._getDataInLocus(locus, options));
        const dataForEachSegment = await Promise.all(promises);
        const flattened = _.flatten(dataForEachSegment);
        return flattened;
    }

    async _getDataInLocus(locus, options) {
        const variants = [];
        let chrom = options.ensemblStyle ? locus.chr.replace("chr", "") : locus.chr;
        if (chrom === "M") {
            chrom = "MT";
        }
        //vcf is 1 based
        // -1 compensation happened in Vcf feature constructor
        await this.vcf.getLines(chrom, locus.start + 1, locus.end, (line) =>
            variants.push(this.parser.parseLine(line))
        );
        if (options.ensemblStyle) {
            for (let variant of variants) {
                variant.CHROM = locus.chr;
            }
        }
        // console.log(variants);
        return variants;
    }
}

export default VcfSource;
