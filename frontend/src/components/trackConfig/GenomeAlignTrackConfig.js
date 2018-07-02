import { TrackConfig } from './TrackConfig';
import { configStaticDataSource } from './configDataFetch';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import GenomeAlignTrack from '../trackVis/GenomeAlignTrack';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import GenomeAlignWorker from '../../dataSources/bed/GenomeAlign.worker';
import AlignmentRecord from '../../model/AlignmentRecord';


/**
 * Converter of records to AlignmentRecords.
 * 
 * @param {record[]} data - records to convert
 * @return {AlignmentRecord[]} AlignmentRecords made from the input
 */
function formatAlignRecords(data) {
    return data.map(record => new AlignmentRecord(record))
}
const withDataFetch = configStaticDataSource(
    props => new WorkerSource(GenomeAlignWorker, props.trackModel.url), formatAlignRecords
);
const TrackWithData = withDataFetch(GenomeAlignTrack);

export class GenomeAlignTrackConfig extends TrackConfig {
    constructor(trackModel) {
        super(trackModel);
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), HeightConfig, BackgroundColorConfig];
    }

    getComponent() {
        return TrackWithData;
    }
}

