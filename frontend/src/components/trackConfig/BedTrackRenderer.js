import AnnotationTrackRenderer from './AnnotationTrackRenderer';
import { configStaticDataSource } from './configDataFetch';
import BedTrack from '../trackVis/bedTrack/BedTrack';

import WorkerSource from '../../dataSources/worker/WorkerSource';
import BedWorker from '../../dataSources/bed/Bed.worker';
import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

const BedColumnIndices = {
    NAME: 3,
    SCORE: 4,
    STRAND: 5,
};

/**
 * Converts BedRecords to Features.
 * 
 * @param {BedRecord[]} data - bed records to convert
 * @return {Feature[]} bed records in the form of Feature
 */
function formatBedRecords(data) {
    return data.map(record => new Feature(
        // "." is a placeholder that means "undefined" in the bed file.
        record[BedColumnIndices.NAME] === "." ? "" : record[BedColumnIndices.NAME],
        new ChromosomeInterval(record.chr, record.start, record.end),
        record[BedColumnIndices.STRAND]
    ));
}
const withDataFetch = configStaticDataSource(
    props => new WorkerSource(BedWorker, props.trackModel.url), formatBedRecords
);
const BedTrackWithData = withDataFetch(BedTrack);

class BedTrackRenderer extends AnnotationTrackRenderer {
    getComponent() {
        return BedTrackWithData;
    }
}

export default BedTrackRenderer;
