import { TrackModel } from './../../model/TrackModel';
import { TrackConfig } from './TrackConfig';
import CallingCardTrack, {DEFAULT_OPTIONS} from '../trackVis/CallingCardTrack';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import LocalBedSource from '../../dataSources/LocalBedSource';
import CallingCard from '../../model/CallingCard';
import BedRecord from '../../dataSources/bed/BedRecord';
import HeightConfig from '../trackContextMenu/HeightConfig';
import YscaleConfig from '../trackContextMenu/YscaleConfig';
import LogScaleConfig from '../trackContextMenu/LogScaleConfig';
import DownsamplingChoices from '../trackContextMenu/DownsamplingConfig';
import OpacitySliderConfig from '../trackContextMenu/OpacitySilderConfig';
import MarkerSizeConfig from '../trackContextMenu/MarkerSizeConfig';
import { BackgroundColorConfig, PrimaryColorConfig } from '../trackContextMenu/ColorConfig';


export class CallingCardTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

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
        return [...super.getMenuComponents(),
            HeightConfig, YscaleConfig, LogScaleConfig, DownsamplingChoices,
            OpacitySliderConfig, MarkerSizeConfig, PrimaryColorConfig, BackgroundColorConfig];
    }
}
