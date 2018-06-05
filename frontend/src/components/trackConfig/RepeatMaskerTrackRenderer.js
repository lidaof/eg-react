import TrackRenderer from './TrackRenderer';
import { configStaticDataSource } from './configDataFetch';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { AnnotationDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import RepeatMaskerTrack, { DEFAULT_OPTIONS, MAX_BASES_PER_PIXEL } from '../trackVis/RepeatMaskerTrack';

import RepeatMaskerFeature from '../../model/RepeatMaskerFeature';
import RepeatSource from '../../dataSources/RepeatSource';

/**
 * Converter of DASFeatures to RepeatMaskerFeatures.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {RepeatMaskerFeature[]} RepeatMaskerFeatures made from the input
 */
function formatDasFeatures(data) {
    console.log(data);
    return data.map(feature => new RepeatMaskerFeature(feature))
}
const withDataFetch = configStaticDataSource(
    props => new RepeatSource(props.trackModel.url, MAX_BASES_PER_PIXEL), formatDasFeatures
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
