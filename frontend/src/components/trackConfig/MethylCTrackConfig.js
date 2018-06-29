import { TrackConfig } from './TrackConfig';
import { configStaticDataSource } from './configDataFetch';

import MethylCTrack, { DEFAULT_OPTIONS } from '../trackVis/MethylCTrack';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import CombineStrandConfig from '../trackContextMenu/CombineStrandConfig';
import { MethylColorConfig, ReadDepthColorConfig } from '../trackContextMenu/MethylColorConfig';

import WorkerSource from '../../dataSources/worker/WorkerSource';
import BedWorker from '../../dataSources/bed/Bed.worker';
import BedRecord from '../../dataSources/bed/BedRecord';

import MethylCRecord from '../../model/MethylCRecord';

/**
 * Converter of BedRecords to MethylCRecords.
 * 
 * @param {BedRecord[]} data - BedRecords to convert
 * @return {MethylCRecord[]} MethylCRecords made from the input
 */
function formatDasFeatures(data) {
    return data.map(feature => new MethylCRecord(feature))
}
const withDataFetch = configStaticDataSource(
    props => new WorkerSource(BedWorker, props.trackModel.url), formatDasFeatures
);
const TrackWithData = withDataFetch(MethylCTrack);

export class MethylCTrackConfig extends TrackConfig {
    constructor(trackModel) {
        super(trackModel);
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
