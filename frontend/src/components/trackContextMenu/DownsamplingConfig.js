import React from 'react';
import SelectConfig from './SelectConfig';
import NumberConfig from './NumberConfig';
import { DownsamplingChoices } from '../../model/DownsamplingChoices';
/**
 * A context menu item that configures track y-scale.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function DownsamplingConfig(props) {
    const downSample = props.optionsObjects[0].show === 'sample' ? <React.Fragment>
        <NumberConfig {...props} 
            optionName="sampleSize" 
            label="Sample size:" 
            isFloat={false}
            min={1}
            defaultValue={1000}
            hasSetButton={true} // when type 0.5 before you type 5 browser trying to set the scale and get fail
        />
    </React.Fragment> : null;
    return (
        <React.Fragment> 
            <SelectConfig 
                {...props} 
                optionName="show" 
                label="Show:" 
                choices={{
                    ALL: DownsamplingChoices.ALL,
                    SAMPLE: DownsamplingChoices.SAMPLE,
                }}
                defaultValue={DownsamplingChoices.ALL}
            />
            {downSample}
        </React.Fragment> 
    );
}

export default DownsamplingConfig;
