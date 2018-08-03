import { AnnotationTrackConfig } from './AnnotationTrackConfig';
import { BedTrack } from '../trackVis/bedTrack/BedTrack';

import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import BedRecord from '../../dataSources/bed/BedRecord';
import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

enum BedColumnIndex {
    NAME=3,
    SCORE=4,
    STRAND=5,
};

export class BedTrackConfig extends AnnotationTrackConfig {
    initDataSource() {
        return new WorkerSource(BedWorker, this.trackModel.url);
    }

    /**
     * Converts BedRecords to Features.
     * 
     * @param {BedRecord[]} data - bed records to convert
     * @return {Feature[]} bed records in the form of Feature
     */
    formatData(data: BedRecord[]) {
        return data.map(record => new Feature(
            // "." is a placeholder that means "undefined" in the bed file.
            record[BedColumnIndex.NAME] === "." ? "" : record[BedColumnIndex.NAME],
            new ChromosomeInterval(record.chr, record.start, record.end),
            record[BedColumnIndex.STRAND]
        ));
    }

    getComponent() {
        return BedTrack;
    }
}
