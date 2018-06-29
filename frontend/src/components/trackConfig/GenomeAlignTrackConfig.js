import { TrackConfig } from './TrackConfig';
import { configStaticDataSource } from './configDataFetch';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import GenomeAlignTrack from '../trackVis/MethylCTrack';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import GenomeAlignWorker from '../../dataSources/bed/GenomeAlign.worker';


const withDataFetch = configStaticDataSource(
    props => new WorkerSource(GenomeAlignWorker, props.trackModel.url)
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

