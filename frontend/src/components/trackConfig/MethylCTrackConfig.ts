import { TrackConfig } from './TrackConfig';

import MethylCTrack, { DEFAULT_OPTIONS } from '../trackVis/MethylCTrack';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';
import MaxMethylAndDepthFilterConfig from '../trackContextMenu/MaxMethylAndDepthFilterConfig';
import CombineStrandConfig from '../trackContextMenu/CombineStrandConfig';
import { MethylColorConfig, ReadDepthColorConfig } from '../trackContextMenu/MethylColorConfig';

import WorkerSource from '../../dataSources/worker/WorkerSource';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import BedRecord from '../../dataSources/bed/BedRecord';
import LocalBedSource from '../../dataSources/LocalBedSource';
import MethylCRecord from '../../model/MethylCRecord';
import { TrackModel } from '../../model/TrackModel';

export class MethylCTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    initDataSource() {
        if (this.trackModel.files) {
            return new LocalBedSource(this.trackModel.files);
        } else {
            return new WorkerSource(BedWorker, this.trackModel.url);
        }
    }

    /**
     * Converts BedRecords to MethylCRecords.
     * 
     * @param {BedRecord[]} data - BedRecords to convert
     * @return {MethylCRecord[]} MethylCRecords made from the input
     */
    formatData(data: BedRecord[]) {
        return data.map(feature => new MethylCRecord(feature));
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), HeightConfig, CombineStrandConfig, MethylColorConfig, 
            MaxMethylAndDepthFilterConfig, ReadDepthColorConfig, BackgroundColorConfig];
    }

    getComponent() {
        return MethylCTrack;
    }
}
