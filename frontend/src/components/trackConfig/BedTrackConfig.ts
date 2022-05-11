import YscaleConfig from "components/trackContextMenu/YscaleConfig";
import { AnnotationDisplayModes } from "./../../model/DisplayModes";
import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import { BedTrack } from "../trackVis/bedTrack/BedTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import Feature from "../../model/Feature";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import LocalBedSource from "../../dataSources/LocalBedSource";
import BedTextSource from "../../dataSources/BedTextSource";
import HiddenPixelsConfig from "../trackContextMenu/HiddenPixelsConfig";
import AlwaysDrawLabelConfig from "components/trackContextMenu/AlwaysDrawLabelConfig";

enum BedColumnIndex {
    NAME = 3,
    SCORE = 4,
    STRAND = 5,
}

export class BedTrackConfig extends AnnotationTrackConfig {
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
        return data.map(
            (record) =>
                new Feature(
                    // "." is a placeholder that means "undefined" in the bed file.
                    record[BedColumnIndex.NAME] === "." ? "" : record[BedColumnIndex.NAME],
                    new ChromosomeInterval(record.chr, record.start, record.end),
                    record[BedColumnIndex.STRAND]
                )
        );
    }

    getComponent() {
        return BedTrack;
    }

    getMenuComponents() {
        const items = [...super.getMenuComponents(), HiddenPixelsConfig, AlwaysDrawLabelConfig];
        if (this.getOptions().displayMode === AnnotationDisplayModes.DENSITY) {
            items.push(YscaleConfig);
        }
        return items;
    }
}
