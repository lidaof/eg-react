import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import { CategoricalTrack } from '../trackVis/categoricalTrack/CategoricalTrack';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import BedRecord from '../../dataSources/bed/BedRecord';
import HeightConfig from '../trackContextMenu/HeightConfig';
import { TrackConfig } from './TrackConfig';
import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { CategoryColorConfig } from '../trackContextMenu/CategoryColorConfig';
import LocalBedSource from '../../dataSources/LocalBedSource';
import HiddenPixelsConfig from '../trackContextMenu/HiddenPixelsConfig';

enum BedColumnIndex {
    CATEGORY=3,
};

export class CategoricalTrackConfig extends TrackConfig {
    
    initDataSource() {
        if (this.trackModel.files.length > 0) {
            return new LocalBedSource(this.trackModel.files);
        } else {
            return new WorkerSource(BedWorker, this.trackModel.url);
        }
    }

     /**
     * Converts BedRecords to Features.
     * 
     * @param {BedRecord[]} data - bed records to convert
     * @return {Feature[]} bed records in the form of Feature
     */
    formatData(data: BedRecord[]) {
        return data.map(record => new Feature(
            record[BedColumnIndex.CATEGORY],
            new ChromosomeInterval(record.chr, record.start, record.end)));
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), HeightConfig, CategoryColorConfig, 
            BackgroundColorConfig, HiddenPixelsConfig];
    }

    getComponent() {
        return CategoricalTrack;
    }
}
