import NumericalTrackRenderer from './NumericalTrackRenderer';
import { configStaticDataSource } from './configDataFetch';
import NumericalTrack from '../trackVis/commonComponents/numerical/NumericalTrack';

import BigWorker from '../../dataSources/big/Big.worker';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { NumericalFeature } from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

/*
Expected DASFeature schema

interface DASFeature {
    max: number; // Chromosome base number, end
    maxScore: number;
    min: number; // Chromosome base number, start
    score: number; // Value at the location
    segment: string; // Chromosome name
    type: string;
    _chromId: number
*/
/**
 * Converter of DASFeatures to NumericalFeature.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {NumericalFeature[]} NumericalFeatures made from the input
 */
function formatDasFeatures(data) {
    return data.map(feature =>
        new NumericalFeature("", new ChromosomeInterval(feature.segment, feature.min, feature.max))
            .withValue(feature.score)
    );
}

const withDataFetch = configStaticDataSource(
    props => new WorkerSource(BigWorker, props.trackModel.url), formatDasFeatures
);
const BigWigTrack = withDataFetch(NumericalTrack);

class BigWigTrackRenderer extends NumericalTrackRenderer {
    getComponent() {
        return BigWigTrack;
    }
}

export default BigWigTrackRenderer;
