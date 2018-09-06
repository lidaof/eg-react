import React from 'react';
import SelectConfig from './SelectConfig';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures track y-scale.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function YscaleConfig(props) {
    console.log(props);
    const fixedScales;
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
            
            <NumberConfig {...props} 
                optionName="min" 
                label="Min:" 
                isFloat={true} 
                hasSetButton={false} 
            />
            <NumberConfig {...props} 
                optionName="max" 
                label="Max:" 
                isFloat={true} 
                hasSetButton={true} 
            />
        </React.Fragment> 
    );
}

export default YscaleConfig;
