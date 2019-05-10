import React from 'react';
import SelectConfig from './SelectConfig';
import NumberConfig from './NumberConfig';
import { PrimaryAboveColorConfig, SecondaryBelowColorConfig } from "./ColorConfig";
import { ScaleChoices } from '../../model/ScaleChoices';
/**
 * A context menu item that configures track y-scale.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function YscaleConfig(props) {
    const fixedScales = props.optionsObjects[0].yScale === 'fixed' ? <React.Fragment>
        <NumberConfig {...props} 
            optionName="yMax" 
            label="Y-axis max:" 
            isFloat={true}
            defaultValue={10}
            hasSetButton={true} // when type 0.5 before you type 5 browser trying to set the scale and get fail
        />
        { props.optionsObjects[0].colorAboveMax && <PrimaryAboveColorConfig {...props} /> }
        <NumberConfig {...props} 
            optionName="yMin" 
            label="Y-axis min:" 
            isFloat={true} 
            hasSetButton={true}
            defaultValue={0}
        />
        { props.optionsObjects[0].color2BelowMin && <SecondaryBelowColorConfig {...props} /> }
    </React.Fragment> : null;
    return (
        <React.Fragment> 
            <SelectConfig 
                {...props} 
                optionName="yScale" 
                label="Y-axis scale:" 
                choices={{
                    AUTO: ScaleChoices.AUTO,
                    FIXED: ScaleChoices.FIXED,
                }}
                defaultValue={ScaleChoices.AUTO}
            />
            {fixedScales}
            
        </React.Fragment> 
    );
}

export default YscaleConfig;
