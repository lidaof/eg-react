import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures track height.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function HiddenPixelsConfig(props) {
    return <NumberConfig 
                {...props} 
                optionName="hiddenPixels" 
                label="Hide item less than (pixels):" 
                minValue={0} 
                step={0.1}
                isFloat={true}
                hasSetButton={true} 
            />;
}

export default HiddenPixelsConfig;
