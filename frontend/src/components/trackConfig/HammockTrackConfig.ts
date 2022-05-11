import JSON5 from "json5";
import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import { BedTrack } from "../trackVis/bedTrack/BedTrack";

import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import Feature from "../../model/Feature";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import LocalBedSource from "../../dataSources/LocalBedSource";

export class HammockTrackConfig extends AnnotationTrackConfig {
    initDataSource() {
        if (this.trackModel.files.length > 0) {
            return new LocalBedSource(this.trackModel.files);
        } else {
            return new WorkerSource(BedWorker, this.trackModel.url, this.trackModel.indexUrl);
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
            const content = JSON5.parse("{" + record[3] + "}");
            const name = content.name || "";
            const strand = content.strand || "+";
            return new Feature(name, new ChromosomeInterval(record.chr, record.start, record.end), strand);
        });
    }

    getComponent() {
        return BedTrack;
    }
}
