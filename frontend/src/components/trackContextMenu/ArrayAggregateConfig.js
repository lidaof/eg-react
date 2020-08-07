import React from "react";
import SelectConfig from "./SelectConfig";
import { ArrayAggregatorTypes } from "../../model/FeatureAggregator";

/**
 * the options to control data aggregate for dynamic numerical track, default is mean
 *
 */

function ArrayAggregateConfig(props) {
    return (
        <SelectConfig
            {...props}
            optionName="arrayAggregateMethod"
            label="Array Aggregate method:"
            choices={ArrayAggregatorTypes}
            defaultValue={ArrayAggregatorTypes.MEAN}
        />
    );
}

export default ArrayAggregateConfig;
