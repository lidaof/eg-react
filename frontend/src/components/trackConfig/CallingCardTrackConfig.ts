import { TrackConfig } from './TrackConfig';
import CallingCardTrack from '../trackVis/CallingCardTrack';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import LocalBedSource from '../../dataSources/LocalBedSource';
import CallingCard from '../../model/CallingCard';
import BedRecord from '../../dataSources/bed/BedRecord';
import HeightConfig from '../trackContextMenu/HeightConfig';
import { BackgroundColorConfig, PrimaryColorConfig } from '../trackContextMenu/ColorConfig';

export class CallingCardTrackConfig extends TrackConfig {
    initDataSource() {
        if (this.trackModel.files.length > 0) {
            return new LocalBedSource(this.trackModel.files);
        } else {
            return new WorkerSource(BedWorker, this.trackModel.url);
        }
    }

    /**
     * Converts BedRecords to CallingCards.
     * 
     * @param {BedRecord[]} data - bed records to convert
     * @return {CallingCard[]} CallingCard records
     */
    formatData(data: BedRecord[]) {
        return data.map(record => new CallingCard(record));
    }

    getComponent() {
        return CallingCardTrack;
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), HeightConfig, PrimaryColorConfig, BackgroundColorConfig];
    }
}
