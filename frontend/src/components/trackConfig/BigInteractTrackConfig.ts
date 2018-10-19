import { TrackConfig } from './TrackConfig';
import InteractionTrack, { DEFAULT_OPTIONS } from '../trackVis/interactionTrack/InteractionTrack';
import { BigWorker } from '../../dataSources/WorkerTSHook';
import WorkerSource from '../../dataSources/worker/WorkerSource';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import { GenomeInteraction } from '../../model/GenomeInteraction';
import { InteractionDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import { PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import ScoreConfig from '../trackContextMenu/ScoreConfig';
/*
Example record from the data source
DASFeature {
    color: "0"
    exp: "."
    label: "."
    max: 63705638
    min: 63702628
    region1Chrom: "chr17"
    region1End: "58880897"
    region1Name: "."
    region1Start: "58878552"
    region1Strand: "."
    region2Chrom: "chr3"
    region2End: "63705638"
    region2Name: "."
    region2Start: "63702628"
    region2Strand: "."
    score: 584
    segment: "chr3"
    type: "bigbed"
    value: "10"
    _chromId: 0
}
*/

export class BigInteractTrackConfig extends TrackConfig {
    constructor(props: any) {
        super(props);
        this.setDefaultOptions(DEFAULT_OPTIONS)
    }

    initDataSource() {
        return new WorkerSource(BigWorker, this.trackModel.url);
    }

    /**
     * Converts DASFeatures to Feature.
     * 
     * @param {DASFeature[]} data - DASFeatures to convert
     * @return {Feature[]} Features made from the input
     */
    formatData(data: any[]) {
        return data.map(record => {
            const recordLocus1 = new ChromosomeInterval(record.region1Chrom, record.region1Start, record.region1End);
            const recordLocus2 = new ChromosomeInterval(record.region2Chrom, record.region2Start, record.region2End);
            return new GenomeInteraction(recordLocus1, recordLocus2, record.score);
        });
    }

    getComponent() {
        return InteractionTrack;
    }

    getMenuComponents() {
        return [InteractionDisplayModeConfig, ScoreConfig,
            PrimaryColorConfig, SecondaryColorConfig, BackgroundColorConfig];
    }
}
