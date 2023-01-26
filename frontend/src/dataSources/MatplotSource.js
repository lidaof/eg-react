import DataSource from "./DataSource";
import { getTrackConfig } from "../components/trackConfig/getTrackConfig";

class MatplotSource extends DataSource {
    constructor(trackModel) {
        super();
        this.sources = [];
        this.configs = [];
        this.allOptions = []; // for each member track, using member's option instead
        trackModel.tracks.forEach((model) => {
            const config = getTrackConfig(model);
            const source = config.initDataSource();
            const oneOption = config.getOptions();
            this.configs.push(config);
            this.sources.push(source);
            this.allOptions.push(oneOption);
        });
    }

    async getData(region, basesPerPixel, options) {
        const dataForEachSource = await Promise.all(
            this.sources.map((source, i) => source.getData(region, basesPerPixel, this.allOptions[i]))
        );
        const formatedData = dataForEachSource.map((d, i) => this.configs[i].formatData(d));
        return formatedData;
    }
}

export default MatplotSource;
