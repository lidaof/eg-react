import React from 'react';
import SelectConfig from './SelectConfig';
import NumberConfig from './NumberConfig';
import { PrimaryAboveColorConfig, SecondaryBelowColorConfig } from "./ColorConfig";
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
            hasSetButton={true} 
        />
        <PrimaryAboveColorConfig {...props} />
        <NumberConfig {...props} 
            optionName="yMin" 
            label="Y-axis min:" 
            isFloat={true} 
            hasSetButton={true} 
        />
        <SecondaryBelowColorConfig {...props} />
    </React.Fragment> : null;
    return (
        <React.Fragment> 
            <SelectConfig 
                {...props} 
                optionName="yScale" 
                label="Y-axis scale:" 
                choices={{
                    AUTO: "auto",
                    FIXED: "fixed",
                }}
                defaultValue="auto"
            />
            {fixedScales}
            
        </React.Fragment> 
    );
}

export default YscaleConfig;
