import NumericalTrackRenderer from './NumericalTrackRenderer';
import { configStaticDataSource } from './configDataFetch';
import NumericalTrack from '../trackVis/commonComponents/numerical/NumericalTrack';

import WorkerSource from '../../dataSources/worker/WorkerSource';
import BedWorker from '../../dataSources/bed/Bed.worker';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import { NumericalFeature } from '../../model/Feature';

/**
 * Converts raw bed records from BedSource to NumericalFeatures.  If we cannot parse a numerical value from a record,
 * the resulting NumericalFeature will have a value of 0.
 * 
 * @param {Object[]} data - BED records
 * @return {NumericalFeature[]} numerical features to draw
 */
function formatBedRecords(data) {
    return data.map(record => {
        const locus = new ChromosomeInterval(record.chr, record.start, record.end);
        const unsafeValue = Number(record[3]);
        const value = Number.isFinite(unsafeValue) ? unsafeValue : 0;
        return new NumericalFeature("", locus).withValue(value);
    });
}

const withDataFetch = configStaticDataSource(props =>
    new WorkerSource(BedWorker, props.trackModel.url), formatBedRecords
);
const BedGraphTrack = withDataFetch(NumericalTrack);

class BedGraphTrackRenderer extends NumericalTrackRenderer {
    getComponent() {
        return BedGraphTrack;
    }
}

export default BedGraphTrackRenderer;
