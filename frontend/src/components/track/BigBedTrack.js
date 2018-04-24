import _ from 'lodash';

import { BedTrack, BedTrackConfig } from './bedTrack/BedTrack';
import configOptionMerging from './commonComponents/configOptionMerging';
import { configStaticDataSource } from './commonComponents/configDataFetch';
import configDataProcessing from './commonComponents/configDataProcessing';
import withTooltip from './commonComponents/withTooltip';

import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import DataProcessor from '../../dataSources/DataProcessor';

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
 */
class BigBedProcessor extends DataProcessor {
    /**
     * Extracts Features from the `data` prop.
     * 
     * @param {Object} props - track props, whose `data` prop should include an array of DASFeature
     * @return {Feature[]} extracted Features from the props
     */
    process(props) {
        if (!props.data) {
            return [];
        }

        let features = props.data.map(record => new Feature(
            record.label || "",
            new ChromosomeInterval(record.segment, record.min, record.max),
            record.orientation
        ));
        for (let i = 0; i < features.length; i++) {
            features[i].index = i;
        }
        return features
    }
}

const withOptionMerging = configOptionMerging(BedTrackConfig.defaultOptions);
const withDataFetch = configStaticDataSource(props => new BigWigOrBedSource(props.trackModel.url));
const withDataProcessing = configDataProcessing(new BigBedProcessor());
const configure = _.flowRight([withOptionMerging, withDataFetch, withDataProcessing, withTooltip]);
const ConfiguredBedTrack = configure(BedTrack);

const BigBedTrackConfig = {
    component: ConfiguredBedTrack,
    menuItems: BedTrackConfig.menuItems,
    defaultOptions: BedTrackConfig.defaultOptions,
};

export default BigBedTrackConfig;
