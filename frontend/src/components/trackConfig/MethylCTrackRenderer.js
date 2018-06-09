import TrackRenderer from './TrackRenderer';
import { configStaticDataSource } from './configDataFetch';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import CombineStrandConfig from '../trackContextMenu/CombineStrandConfig';
import {MethylColorConfig, ReadDepthColorConfig} from '../trackContextMenu/MethylColorConfig';
import MethylCTrack, { DEFAULT_OPTIONS } from '../trackVis/MethylCTrack';

import WorkerSource from '../../dataSources/worker/WorkerSource';
import BedWorker from '../../dataSources/bed/Bed.worker';
import MethylCRecord from '../../model/MethylCRecord';

/**
 * Converter of DASFeatures to MethylCRecords.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {MethylCRecord[]} MethylCRecords made from the input
 */
function formatDasFeatures(data) {
    return data.map(feature => new MethylCRecord(feature))
}
const withDataFetch = configStaticDataSource(
    props => new WorkerSource(BedWorker, props.trackModel.url), formatDasFeatures
);
const TrackWithData = withDataFetch(MethylCTrack);

class MethylCTrackRenderer extends TrackRenderer {
    constructor(props) {
        super(props);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), HeightConfig, CombineStrandConfig, MethylColorConfig,
            ReadDepthColorConfig, BackgroundColorConfig];
    }

    getComponent() {
        return TrackWithData;
    }
}

export default MethylCTrackRenderer;
