import _ from 'lodash';

import BigWigTrack from './BigWigTrack';
import NumericalTrack from './commonComponents/NumericalTrack';
import configDataProcessing from './commonComponents/configDataProcessing';
import { configStaticDataSource } from './commonComponents/configDataFetch';
import configOptionMerging from './commonComponents/configOptionMerging';

import BedSource from '../../dataSources/BedSource';
import DataProcessor from '../../dataSources/DataProcessor';
import { NumericalFeature } from '../../model/BarRecord';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

/**
 * Converter of BED records into NumericalFeatures
 */
class BedProcessor extends DataProcessor {
    /**
     * Parses a number with a default of 0 if parsing fails.
     * 
     * @param {string} string - number to parse
     * @return {number} parsed number, or 0 if parsing fails
     */
    safelyParseNumber(string) {
        const result = Number(string);
        return Number.isFinite(result) ? result : 0;
    }

    /**
     * Converts raw records from BedSource to NumericalFeatures
     * 
     * @param {Object[]} props - object whose `data` prop contains BED records
     * @return {NumericalFeature[]} numerical features to draw
     */
    process(props) {
        if (!props.data) {
            return [];
        }

        return props.data.map(record => new NumericalFeature(
            new ChromosomeInterval(record.chr, record.start, record.end), this.safelyParseNumber(record[3])
        ))
    }
}

const withDefaultOptions = configOptionMerging(BigWigTrack.defaultOptions);
const withDataFetch = configStaticDataSource(props => new BedSource(props.trackModel.url));
const withDataProcessing = configDataProcessing(new BedProcessor());
const configure = _.flowRight([withDefaultOptions, withDataFetch, withDataProcessing]);

const BedGraphConfig = {
    component: configure(NumericalTrack),
    menuItems: BigWigTrack.menuItems,
    defaultOptions: BigWigTrack.defaultOptions,
};

export default BedGraphConfig;
