import _ from 'lodash';

import BigWigTrack from './BigWigTrack';
import NumericalTrack from './commonComponents/NumericalTrack';
import { configStaticDataSource } from './commonComponents/configDataFetch';
import configOptionMerging from './commonComponents/configOptionMerging';

import BedSource from '../../dataSources/BedSource';
import { NumericalFeature } from '../../model/BarRecord';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

/**
 * Converts raw bed records from BedSource to NumericalFeatures.  If we cannot parse a numerical value from a record,
 * the resulting NumericalFeature will have a value of 0.
 * 
 * @param {Object[]} data - BED records
 * @return {NumericalFeature[]} numerical features to draw
 */
function formatBedRecords(data) {
    return data.map(record => {
        const locus = new ChromosomeInterval(record.chr, record.start, record.end);
        const unsafeValue = Number(record[3]);
        const value = Number.isFinite(unsafeValue) ? unsafeValue : 0;
        return new NumericalFeature(locus, value);
    });
}

const withDefaultOptions = configOptionMerging(BigWigTrack.defaultOptions);
const withDataFetch = configStaticDataSource(props => new BedSource(props.trackModel.url), formatBedRecords);
const configure = _.flowRight([withDefaultOptions, withDataFetch]);

const BedGraphConfig = {
    component: configure(NumericalTrack),
    menuItems: BigWigTrack.menuItems,
    defaultOptions: BigWigTrack.defaultOptions,
};

export default BedGraphConfig;
