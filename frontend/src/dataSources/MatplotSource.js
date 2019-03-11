import DataSource from "./DataSource";
import { getTrackConfig } from "../components/trackConfig/getTrackConfig";

class MatplotSource extends DataSource {
    constructor(trackModel) {
        super();
        this.sources = [];
        this.configs = [];
        trackModel.tracks.forEach(model => {
            const config = getTrackConfig(model);
            const source = config.initDataSource();
            this.configs.push(config);
            this.sources.push(source);
        });
    }

    async getData(region, basesPerPixel, options) {
        const dataForEachSource = await Promise.all(this.sources.map(source => source.getData(region)));
        const formatedData = dataForEachSource.map((d,i) => this.configs[i].formatData(d));
        return formatedData;
    }
}

export default MatplotSource;