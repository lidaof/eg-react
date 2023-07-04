import RowHeightConfig from "components/trackContextMenu/RowHeightConfig";
import HeightConfig from "components/trackContextMenu/HeightConfig";
import { Fiber } from "./../../model/Feature";
import YscaleConfig from "components/trackContextMenu/YscaleConfig";
import { FiberTrack, DEFAULT_OPTIONS } from "../trackVis/bedTrack/FiberTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import LocalBedSource from "../../dataSources/LocalBedSource";
import BedTextSource from "../../dataSources/BedTextSource";
import HiddenPixelsConfig from "../trackContextMenu/HiddenPixelsConfig";
import { PrimaryColorConfig, SecondaryColorConfig } from "components/trackContextMenu/ColorConfig";
import TrackModel from "model/TrackModel";
import { TrackConfig } from "./TrackConfig";
import { FiberDisplayModeConfig } from "components/trackContextMenu/DisplayModeConfig";
import MaxRowsConfig from "components/trackContextMenu/MaxRowsConfig";
import HideMinimalItemsConfig from "components/trackContextMenu/HideMinimalItemsConfig";
import SortItemsConfig from "components/trackContextMenu/SortItemsConfig";
import { parseNumberString } from "./../../util";
import PixelsPaddingConfig from "components/trackContextMenu/PixelsPaddingConfig";

export class FiberTrackConfig extends TrackConfig {
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
     * Converts BedRecords to Features.
     *
     * @param {BedRecord[]} data - bed records to convert
     * @return {Feature[]} bed records in the form of Feature
     */
    formatData(data: BedRecord[]) {
        return data.map((record) => {
            return new Fiber(
                record[3],
                new ChromosomeInterval(record.chr, record.start, record.end),
                record[5]
            ).withFiber(parseNumberString(record[4]), record[6], record[7]);
        });
    }

    getComponent() {
        return FiberTrack;
    }

    getMenuComponents() {
        const items = [
            ...super.getMenuComponents(),
            FiberDisplayModeConfig,
            RowHeightConfig,
            PrimaryColorConfig,
            SecondaryColorConfig,
            MaxRowsConfig,
            HiddenPixelsConfig,
            HeightConfig,
            YscaleConfig,
            SortItemsConfig,
            HideMinimalItemsConfig,
            PixelsPaddingConfig,
        ];
        return items;
    }
}
