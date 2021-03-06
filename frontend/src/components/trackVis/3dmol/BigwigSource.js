import { BigWig } from "@gmod/bbi";
import { RemoteFile } from "generic-filehandle";
import { fetch } from "node-fetch";

export class BigwigSource {
    constructor(url) {
        this.url = url;
        const headers = this.url.includes("4dnucleome")
            ? {
                  Authorization: process.env.REACT_APP_4DN_KEY,
              }
            : {};
        this.bw = new BigWig({
            filehandle: new RemoteFile(url, { fetch, overrides: { headers } }),
        });
    }

    async getData(chrom, start, end, opts) {
        return await this.bw.getFeatures(chrom, start, end, opts);
    }
}
