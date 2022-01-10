import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import GeneAnnotationTrack from "../trackVis/geneAnnotationTrack/GeneAnnotationTrack";
import { DEFAULT_OPTIONS } from "../trackVis/geneAnnotationTrack/GeneAnnotation";
import GeneSource from "../../dataSources/GeneSource";
import Gene from "../../model/Gene";
import { TrackModel } from "../../model/TrackModel";
import HiddenPixelsConfig from "../trackContextMenu/HiddenPixelsConfig";
import ItalicizeTextConfig from "components/trackContextMenu/ItalicizeTextConfig";

export class GeneAnnotationTrackConfig extends AnnotationTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        return new GeneSource(this.trackModel);
    }

    formatData(data: any[]) {
        return data.map((record) => new Gene(record));
    }

    getComponent() {
        return GeneAnnotationTrack;
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), ItalicizeTextConfig, HiddenPixelsConfig];
    }
}
