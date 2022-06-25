import { TrackConfig } from "./TrackConfig";
import DynamicNumericalTrack, { DEFAULT_OPTIONS } from "../trackVis/commonComponents/numerical/DynamicNumericalTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import { NumericalArrayFeature } from "../../model/Feature";
import BedRecord from "../../dataSources/bed/BedRecord";
import LocalBedSource from "../../dataSources/LocalBedSource";
import BedTextSource from "../../dataSources/BedTextSource";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import PlayingConfig from "components/trackContextMenu/PlayingConfig";
import UseDynamicColorsConfig from "components/trackContextMenu/UseDynamicColorsConfig";
import HeightConfig from "components/trackContextMenu/HeightConfig";
import { BackgroundColorConfig, PrimaryColorConfig } from "components/trackContextMenu/ColorConfig";
import TrackModel from "model/TrackModel";
import SpeedConfig from "components/trackContextMenu/SpeedConfig";
import ArrayAggregateConfig from "components/trackContextMenu/ArrayAggregateConfig";

const VALUE_COLUMN_INDEX = 3;

export class DynamicBedGraphTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }
    initDataSource() {
        if (this.trackModel.isText) {
            return new BedTextSource({
                url: this.trackModel.url,
                blob: this.trackModel.fileObj,
                textConfig: this.trackModel.textConfig,
            });
        } else {
            if (this.trackModel.files.length > 0) {
                return new LocalBedSource(this.trackModel.files);
            } else {
                return new WorkerSource(BedWorker, this.trackModel.url, this.trackModel.indexUrl);
            }
        }
    }

    /**
     * Converts raw bed records to NumericalArrayFeature.  If we cannot parse a numerical value from a
     * record, the resulting NumericalFeature will have a value of 0.
     *
     * @param {Object[]} data - BED records
     * @return {NumericalArrayFeature[]} numerical features to draw
     */
    formatData(data: BedRecord[]) {
        return data.map((record) => {
            const locus = new ChromosomeInterval(record.chr, record.start, record.end);
            let parsedValue;
            try {
                parsedValue = JSON.parse(record[VALUE_COLUMN_INDEX]);
            } catch (e) {
                console.error(e);
                parsedValue = [0];
            }
            return new NumericalArrayFeature("", locus).withValues(parsedValue);
        });
    }

    getComponent() {
        return DynamicNumericalTrack;
    }

    getMenuComponents() {
        const items = [
            LabelConfig,
            PlayingConfig,
            SpeedConfig,
            HeightConfig,
            ArrayAggregateConfig,
            PrimaryColorConfig,
            UseDynamicColorsConfig,
            BackgroundColorConfig,
        ];

        return items;
    }
}
