import _ from 'lodash';

import { BedTrack, BedTrackConfig } from './bedTrack/BedTrack';
import configOptionMerging from './commonComponents/configOptionMerging';
import { configStaticDataSource } from './commonComponents/configDataFetch';
import withTooltip from './commonComponents/tooltip/withTooltip';

import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

/*
Example record from BigWigOrBedSource
DASFeature {
    label: "NR_037940",
    max: 27219880,
    min: 27202057,
    orientation: "-",
    score: 35336,
    segment: "chr7",
    type: "bigbed",
    _chromId: 19
}
*/
/**
 * Converter of DASFeatures to Feature.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {Feature[]} Features made from the input
 */
function formatDasFeatures(data) {
    return data.map(record => new Feature(
        record.label || "",
        new ChromosomeInterval(record.segment, record.min, record.max),
        record.orientation
    ));
}

const withOptionMerging = configOptionMerging(BedTrackConfig.defaultOptions);
const withDataFetch = configStaticDataSource(props => new BigWigOrBedSource(props.trackModel.url), formatDasFeatures);
const configure = _.flowRight([withOptionMerging, withDataFetch, withTooltip]);

const BigBedTrackConfig = {
    component: configure(BedTrack),
    menuItems: BedTrackConfig.menuItems,
    defaultOptions: BedTrackConfig.defaultOptions,
};

export default BigBedTrackConfig;
