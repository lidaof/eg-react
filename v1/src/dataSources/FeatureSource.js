import DataSource from './DataSource';

class FeatureSource extends DataSource {
    constructor(url, isIndexed=true) {
        super();
        this.igvFeatureSource = new window.igv.FeatureSource({
            url: url,
            isIndexed: isIndexed,
        });
        this.headerPromise = this.igvFeatureSource.getFileHeader();
    }

    async getData(region) {
        await this.headerPromise;

        let requests = [];
        for (let chrInterval of region.getRegionList()) {
            requests.push(this.igvFeatureSource.getFeatures(chrInterval.name, chrInterval.start, chrInterval.end));
        }

        // Concatenate all the data into one array
        return Promise.all(requests).then(results => [].concat.apply([], results));
    }
}

export default FeatureSource;
