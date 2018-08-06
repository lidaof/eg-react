import { AnnotationTrackConfig } from './AnnotationTrackConfig';
import { BedTrack } from '../trackVis/bedTrack/BedTrack';

import { BigWorker } from '../../dataSources/WorkerTSHook';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

/*
Example record from the data source
DASFeature {
    label: "NR_037940",
    max: 27219880,
    min: 27202057,
    orientation: "-",
    score: 35336,
    segment: "chr7",
    type: "bigbed",
    _chromId: 19
}
*/

export class BigBedTrackConfig extends AnnotationTrackConfig {
    initDataSource() {
        return new WorkerSource(BigWorker, this.trackModel.url);
    }

    /**
     * Converts DASFeatures to Feature.
     * 
     * @param {DASFeature[]} data - DASFeatures to convert
     * @return {Feature[]} Features made from the input
     */
    formatData(data: any[]) {
        return data.map(record => new Feature(
            record.label || "",
            new ChromosomeInterval(record.segment, record.min, record.max),
            record.orientation
        ));
    }

    getComponent() {
        return BedTrack;
    }
}
