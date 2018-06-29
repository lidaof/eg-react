import { AnnotationTrackConfig } from './AnnotationTrackConfig';
import { configStaticDataSource } from './configDataFetch';
import BedTrack from '../trackVis/bedTrack/BedTrack';

import BigWorker from '../../dataSources/big/Big.worker';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

/*
Example record from BigWigOrBedSource
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
/**
 * Converter of DASFeatures to Feature.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {Feature[]} Features made from the input
 */
function formatDasFeatures(data) {
    return data.map(record => new Feature(
        record.label || "",
        new ChromosomeInterval(record.segment, record.min, record.max),
        record.orientation
    ));
}
const withDataFetch = configStaticDataSource(
    props => new WorkerSource(BigWorker, props.trackModel.url), formatDasFeatures
);
const BedTrackWithData = withDataFetch(BedTrack);

export class BigBedTrackConfig extends AnnotationTrackConfig {
    getComponent() {
        return BedTrackWithData;
    }
}
