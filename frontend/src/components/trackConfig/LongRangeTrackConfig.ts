import { TrackConfig } from './TrackConfig';
import WorkerSource from '../../dataSources/worker/WorkerSource';
// import { LongRangeWorker } from '../../dataSources/WorkerTSHook';
import { BedWorker } from '../../dataSources/WorkerTSHook';
import BedRecord from '../../dataSources/bed/BedRecord';
import InteractionTrack, { DEFAULT_OPTIONS } from '../trackVis/interactionTrack/InteractionTrack';
import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { InteractionDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import ScoreConfig from '../trackContextMenu/ScoreConfig';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import { GenomeInteraction } from '../../model/GenomeInteraction';
import LocalBedSource from '../../dataSources/LocalBedSource';
import HeightConfig from '../trackContextMenu/HeightConfig';

export class LongRangeTrackConfig extends TrackConfig {
    constructor(props: any) {
        super(props);
        this.setDefaultOptions(DEFAULT_OPTIONS)
    }

    initDataSource() {
        if (this.trackModel.files.length > 0) {
            return new LocalBedSource(this.trackModel.files);
        } else {
            return new WorkerSource(BedWorker, this.trackModel.url);
        }
    }

    /**
     * Converts BedRecords to GenomeInteractions.
     * 
     * @param {BedRecord[]} data - bed records to convert
     * @return {GenomeInteraction[]} GenomeInteractions
     */
    formatData(data: BedRecord[]) {
        const interactions: any = [];
        data.forEach(record => {
            const regexMatch = record[3].match(/(\w+)\W+(\d+)\W+(\d+)\W+(\d+)/);
            if (regexMatch) {
                const chr = regexMatch[1];
                const start = Number.parseInt(regexMatch[2], 10);
                const end = Number.parseInt(regexMatch[3], 10);
                const score = Number.parseFloat(regexMatch[4]);
                const recordLocus1 = new ChromosomeInterval(record.chr, record.start, record.end);
                const recordLocus2 = new ChromosomeInterval(chr, start, end);
                interactions.push(new GenomeInteraction(recordLocus1, recordLocus2, score));
            } else {
                console.error(`${record[3]} not formated correctly in longrange track`);
            }
        });
        return interactions;
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        return [InteractionDisplayModeConfig, HeightConfig, ScoreConfig,
            PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig];
    }
}
