import { InteractionDisplayMode } from "./../../model/DisplayModes";
import { TrackConfig } from "./TrackConfig";
import WorkerSource from "../../dataSources/worker/WorkerSource";
// import { LongRangeWorker } from '../../dataSources/WorkerTSHook';
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import InteractionTrack, { DEFAULT_OPTIONS } from "../trackVis/interactionTrack/InteractionTrack";
import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import { InteractionDisplayModeConfig } from "../trackContextMenu/DisplayModeConfig";
import ScoreConfig from "../trackContextMenu/ScoreConfig";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import { GenomeInteraction } from "../../model/GenomeInteraction";
import LocalBedSource from "../../dataSources/LocalBedSource";
import HeightConfig from "../trackContextMenu/HeightConfig";
import LineWidthConfig from "../trackContextMenu/LineWidthConfig";
import LongrangeAndreaTextSource from "../../dataSources/LongrangeAndreaTextSource";
import BedTextSource from "../../dataSources/BedTextSource";

export class LongRangeTrackConfig extends TrackConfig {
    constructor(props: any) {
        super(props);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        if (this.trackModel.isText) {
            if (this.trackModel.textConfig.subType === "AndreaGillespie") {
                return new LongrangeAndreaTextSource({
                    url: this.trackModel.url,
                    blob: this.trackModel.fileObj,
                    textConfig: this.trackModel.textConfig,
                });
            } else {
                return new BedTextSource({
                    url: this.trackModel.url,
                    blob: this.trackModel.fileObj,
                    textConfig: this.trackModel.textConfig,
                });
            }
        } else {
            if (this.trackModel.files.length > 0) {
                return new LocalBedSource(this.trackModel.files);
            } else {
                return new WorkerSource(BedWorker, this.trackModel.url);
            }
        }
    }

    /**
     * Converts BedRecords to GenomeInteractions.
     *
     * @param {BedRecord[]} data - bed records to convert
     * @return {GenomeInteraction[]} GenomeInteractions
     */
    formatData(data: BedRecord[]) {
        const interactions: any = [];
        data.forEach((record) => {
            const regexMatch = record[3].match(/([\w.]+)\W+(\d+)\W+(\d+)\W+(\d+)/);
            // console.log(regexMatch);
            if (regexMatch) {
                const chr = regexMatch[1];
                const start = Number.parseInt(regexMatch[2], 10);
                const end = Number.parseInt(regexMatch[3], 10);
                // const score = Number.parseFloat(regexMatch[4]); // this also convert -2 to 2 as score
                const score = Number.parseFloat(record[3].split(",")[1]);
                const recordLocus1 = new ChromosomeInterval(record.chr, record.start, record.end);
                const recordLocus2 = new ChromosomeInterval(chr, start, end);
                interactions.push(new GenomeInteraction(recordLocus1, recordLocus2, score));
            } else {
                console.error(`${record[3]} not formated correctly in longrange track`);
            }
        });
        return interactions;
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        const items = [
            InteractionDisplayModeConfig,
            HeightConfig,
            ScoreConfig,
            PrimaryColorConfig,
            SecondaryColorConfig,
            BackgroundColorConfig,
        ];
        if (this.getOptions().displayMode === InteractionDisplayMode.ARC) {
            items.splice(1, 0, LineWidthConfig);
        }
        return items;
    }
}
