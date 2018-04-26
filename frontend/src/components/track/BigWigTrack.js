import _ from 'lodash';

import NumericalTrack from './commonComponents/NumericalTrack';
import configDataProcessing from './commonComponents/configDataProcessing';
import { configStaticDataSource } from './commonComponents/configDataFetch';
import configOptionMerging from './commonComponents/configOptionMerging';

import { PrimaryColorConfig, BackgroundColorConfig } from './contextMenu/ColorConfig';

import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import DataProcessor from '../../dataSources/DataProcessor';

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
 * Converter of DASFeatures to NumericalFeatures.
 */
class DASFeatureProcessor extends DataProcessor {
    /**
     * Converts raw records from bbi-js to NumericalFeatures.
     * 
     * @param {Object} props - object whose `data` prop contains BED records
     * @return {NumericalFeature[]} numerical features to draw
     */
    process(props) {
        if (!props.data) {
            return [];
        }
        return props.data.map(feature =>
            new NumericalFeature(new ChromosomeInterval(feature.segment, feature.min, feature.max), feature.score)
        );
    }
}

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);
const withDataFetch = configStaticDataSource(props => new BigWigOrBedSource(props.trackModel.url));
const withDataProcessing = configDataProcessing(new DASFeatureProcessor());
const configure = _.flowRight([withDefaultOptions, withDataFetch, withDataProcessing]);

const BigWigConfig = {
    component: configure(NumericalTrack),
    menuItems: [PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS
};

export default BigWigConfig;
