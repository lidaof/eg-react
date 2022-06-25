import { TrackModel } from "./../../model/TrackModel";
import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import { JasparTrack, DEFAULT_OPTIONS, MAX_BASES_PER_PIXEL } from "../trackVis/bedTrack/JasparTrack";
import JasparSource from "../../dataSources/JasparSource";
import { JasparFeature } from "../../model/Feature";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import HiddenPixelsConfig from "../../components/trackContextMenu/HiddenPixelsConfig";
import AlwaysDrawLabelConfig from "../../components/trackContextMenu/AlwaysDrawLabelConfig";
import { AnnotationDisplayModes } from "../../model/DisplayModes";
import YscaleConfig from "../../components/trackContextMenu/YscaleConfig";

export class JasparTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new JasparSource(this.trackModel, MAX_BASES_PER_PIXEL);
    }

    /**
     * Converts data to JasparFeature.
     *  chr: "chr7"
        chromId: 41
        end: 27213427
        rest: "MA0697.2\t387\t+\tZic3"
        start: 27213414
        uniqueId: "bb-24596656246454"
     *
     * @param {data[]} data - data to convert
     * @return {JasparFeature[]} JasparFeature made from the input
     */
    formatData(data: any[]) {
        return data.map((record) => {
            const rest = record.rest.split("\t");
            return new JasparFeature(
                rest[3],
                new ChromosomeInterval(record.chr, record.start, record.end),
                rest[2]
            ).withJaspar(Number.parseInt(rest[1], 10), rest[0]);
        });
    }

    getComponent() {
        return JasparTrack;
    }

    getMenuComponents() {
        const items = [...super.getMenuComponents(), HiddenPixelsConfig, AlwaysDrawLabelConfig];
        if (this.getOptions().displayMode === AnnotationDisplayModes.DENSITY) {
            items.push(YscaleConfig);
        }
        return items;
    }
}
