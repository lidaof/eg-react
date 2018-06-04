import TrackRenderer from './TrackRenderer';
import { configStaticDataSource } from './configDataFetch';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { AnnotationDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import RepeatMaskerTrack, { DEFAULT_OPTIONS } from '../trackVis/RepeatMaskerTrack';

import BigWorker from '../../dataSources/big/Big.worker';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import RepeatMaskerFeature from '../../model/RepeatMaskerFeature';

/**
 * Converter of DASFeatures to RepeatMaskerFeatures.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {RepeatMaskerFeature[]} RepeatMaskerFeatures made from the input
 */
function formatDasFeatures(data) {
    return data.map(feature => new RepeatMaskerFeature(feature))
}
const withDataFetch = configStaticDataSource(
    props => new WorkerSource(BigWorker, props.trackModel.url), formatDasFeatures
);
const TrackWithData = withDataFetch(RepeatMaskerTrack);

class RepeatMaskerTrackRenderer extends TrackRenderer {
    constructor(props) {
        super(props);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), AnnotationDisplayModeConfig, HeightConfig, BackgroundColorConfig];
    }

    getComponent() {
        return TrackWithData;
    }
}

export default RepeatMaskerTrackRenderer;
