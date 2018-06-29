import { TrackConfig } from './TrackConfig';
import { configStaticDataSource } from './configDataFetch';
import RepeatSource from '../../dataSources/RepeatSource';

import RepeatMaskerTrack, { DEFAULT_OPTIONS, MAX_BASES_PER_PIXEL } from '../trackVis/RepeatMaskerTrack';

import { BackgroundColorConfig } from '../trackContextMenu/ColorConfig';
import { AnnotationDisplayModeConfig } from '../trackContextMenu/DisplayModeConfig';
import HeightConfig from '../trackContextMenu/HeightConfig';

import { RepeatDASFeature, RepeatMaskerFeature } from '../../model/RepeatMaskerFeature';
import { TrackModel } from '../../model/TrackModel';

/**
 * Converter of DASFeatures to RepeatMaskerFeatures.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {RepeatMaskerFeature[]} RepeatMaskerFeatures made from the input
 */
function formatDasFeatures(data: RepeatDASFeature[]) {
    return data.map(feature => new RepeatMaskerFeature(feature))
}
const withDataFetch = configStaticDataSource(
    (props: any) => new RepeatSource(props.trackModel.url, MAX_BASES_PER_PIXEL), formatDasFeatures
);
const RepeatTrackWithData = withDataFetch(RepeatMaskerTrack);

export class RepeatMaskerTrackConfig extends TrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        this.setDefaultOptions(DEFAULT_OPTIONS);
    }

    getComponent() {
        return RepeatTrackWithData;
    }

    getMenuComponents() {
        return [...super.getMenuComponents(), AnnotationDisplayModeConfig, HeightConfig, BackgroundColorConfig];
    }
}

