import { BigWig } from '@gmod/bbi';

export class BigwigSource {
    constructor(url){
        this.url = url;
        this.bw = new BigWig({
            url,
        });
        this.header = null;
    }

    async getData(chrom, start, end, opts) {
        return await this.bw.getFeatures(chrom, start, end, opts);
    }
}