import _ from 'lodash';

import NumericalTrack, { SUGGESTED_MENU_ITEMS } from './commonComponents/NumericalTrack';
import { configStaticDataSource } from './commonComponents/configDataFetch';
import configOptionMerging from './commonComponents/configOptionMerging';

import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import { NumericalFeature } from '../../model/BarRecord';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import BarRecordAggregator from '../../model/BarRecordAggregator';

const DEFAULT_OPTIONS = {
    height: 40,
    color: "blue",
    aggregateMethod: BarRecordAggregator.AggregatorTypes.MEAN
};

/*
Expected DASFeature schema

interface DASFeature {
    max: number; // Chromosome base number, end
    maxScore: number;
    min: number; // Chromosome base number, start
    score: number; // Value at the location
    segment: string; // Chromosome name
    type: string;
    _chromId: number
*/
/**
 * Converter of DASFeatures to NumericalFeature.
 * 
 * @param {DASFeature[]} data - DASFeatures to convert
 * @return {NumericalFeature[]} NumericalFeatures made from the input
 */
function formatDasFeatures(data) {
    return data.map(feature =>
        new NumericalFeature(new ChromosomeInterval(feature.segment, feature.min, feature.max), feature.score)
    );
}

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);
const withDataFetch = configStaticDataSource(props => new BigWigOrBedSource(props.trackModel.url), formatDasFeatures);
const configure = _.flowRight([withDefaultOptions, withDataFetch]);

const BigWigConfig = {
    component: configure(NumericalTrack),
    menuItems: SUGGESTED_MENU_ITEMS,
    defaultOptions: DEFAULT_OPTIONS
};

export default BigWigConfig;
