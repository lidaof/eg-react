import React from 'react';
import SelectConfig from './SelectConfig';
import { AggregatorTypes } from '../../model/FeatureAggregator';

/**
 * the options to control data aggregate for numerical track, default is mean
 * 
 */

function AggregateConfig(props) {
    return (
            <SelectConfig 
                {...props} 
                optionName="aggregateMethod" 
                label="Aggregate method:" 
                choices={AggregatorTypes}
                defaultValue={AggregatorTypes.Mean}
            />
        );
}

export default AggregateConfig;