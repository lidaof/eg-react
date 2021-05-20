import _ from "lodash";
import { BlobFile, RemoteFile } from "generic-filehandle";
import { TabixIndexedFile } from "@gmod/tabix";
import VCF from "@gmod/vcf";
import DataSource from "./DataSource";

class VcfSource extends DataSource {
    constructor(param) {
        // is param is string, it's a url, otherwise a File Obj array
        super();
        let filehandle, tbiFilehandle;
        if (typeof param === "string") {
            filehandle = new RemoteFile(param);
            tbiFilehandle = new RemoteFile(param + ".tbi");
        } else {
            tbiFilehandle = new BlobFile(param.filter((f) => f.name.endsWith(".tbi"))[0]);
            filehandle = new BlobFile(param.filter((f) => !f.name.endsWith(".tbi"))[0]);
        }
        this.vcf = new TabixIndexedFile({ filehandle, tbiFilehandle });
        // console.log(this.vcf);
        this.header = null;
        this.parser = null;
    }

    async getData(region, basesPerPixel, options = {}) {
        if (!this.header) {
            this.header = await this.vcf.getHeader();
        }
        if (!this.parser) {
            this.parser = new VCF({ header: this.header });
        }
        const promises = region.getGenomeIntervals().map((locus) => this._getDataInLocus(locus));
        const dataForEachSegment = await Promise.all(promises);
        const flattened = _.flatten(dataForEachSegment);
        return flattened;
    }

    async _getDataInLocus(locus) {
        const variants = [];
        await this.vcf.getLines(locus.chr, locus.start + 1, locus.end, (line) =>
            variants.push(this.parser.parseLine(line))
        );
        return variants;
    }
}

export default VcfSource;
