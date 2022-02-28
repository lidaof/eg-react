import LabelConfig from "components/trackContextMenu/LabelConfig";
import { TrackOptions } from "model/TrackModel";
import { InteractionDisplayMode } from "../../model/DisplayModes";
import { TrackConfig } from "./TrackConfig";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import InteractionTrack, { DEFAULT_OPTIONS } from "../trackVis/interactionTrack/InteractionTrack";
import { BackgroundColorConfig } from "../trackContextMenu/ColorConfig";
import { InteractionDisplayModeConfig } from "../trackContextMenu/DisplayModeConfig";
import ScoreConfig from "../trackContextMenu/ScoreConfig";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import { GenomeInteraction } from "../../model/GenomeInteraction";
import LocalBedSource from "../../dataSources/LocalBedSource";
import HeightConfig from "../trackContextMenu/HeightConfig";
import LineWidthConfig from "../trackContextMenu/LineWidthConfig";
import BedTextSource from "../../dataSources/BedTextSource";
import FetchViewWindowConfig from "components/trackContextMenu/FetchViewWindowConfig";
import MaxValueFilterConfig from "components/trackContextMenu/MaxValueFilterConfig";
import MinValueFilterConfig from "components/trackContextMenu/MinValueFilterConfig";
import BothAnchorsInViewConfig from "components/trackContextMenu/BothAnchorsInViewConfig";
import ClampHeightConfig from "components/trackContextMenu/ClampHeightConfig";

export class LongRangeColorTrackConfig extends TrackConfig {
    constructor(props: any) {
        super(props);
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
                const name = record[4] ? record[4] : undefined;
                const color = record[5] ? record[5] : undefined;
                interactions.push(new GenomeInteraction(recordLocus1, recordLocus2, score, name, color));
            } else {
                console.error(`${record[3]} not formated correctly in longrange track`);
            }
        });
        return interactions;
    }

    /**
     * @override
     */
    shouldFetchBecauseOptionChange(oldOptions: TrackOptions, newOptions: TrackOptions): boolean {
        return oldOptions.fetchViewWindowOnly !== newOptions.fetchViewWindowOnly;
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        const items = [
            LabelConfig,
            InteractionDisplayModeConfig,
            HeightConfig,
            ScoreConfig,
            BackgroundColorConfig,
            MaxValueFilterConfig,
            MinValueFilterConfig,
            FetchViewWindowConfig,
            BothAnchorsInViewConfig,
        ];
        if (this.getOptions().displayMode === InteractionDisplayMode.ARC) {
            items.splice(1, 0, LineWidthConfig);
        }
        if (
            this.getOptions().displayMode === InteractionDisplayMode.HEATMAP ||
            this.getOptions().displayMode === InteractionDisplayMode.ARC
        ) {
            items.push(ClampHeightConfig);
        }
        return items;
    }
}
