import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import { TrackModel } from "../../model/TrackModel";
import { SnpTrack, DEFAULT_OPTIONS } from "../trackVis/SnpTrack/SnpTrack";
import SnpSource from "../../dataSources/SnpSource";
import Snp from "../../model/Snp";
import HiddenPixelsConfig from "components/trackContextMenu/HiddenPixelsConfig";
import { AnnotationDisplayModes } from "model/DisplayModes";
import YscaleConfig from "components/trackContextMenu/YscaleConfig";
import AlwaysDrawLabelConfig from "components/trackContextMenu/AlwaysDrawLabelConfig";

export class SnpTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new SnpSource(this.trackModel);
    }

    formatData(data: any[]) {
        return data.map((record) => new Snp(record));
    }

    getComponent() {
        return SnpTrack;
    }

    getMenuComponents() {
        const items = [...super.getMenuComponents(), HiddenPixelsConfig, AlwaysDrawLabelConfig];
        if (this.getOptions().displayMode === AnnotationDisplayModes.DENSITY) {
            items.push(YscaleConfig);
        }
        return items;
    }
}
