import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures track height.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function HeightConfig(props) {
    return <NumberConfig 
                {...props} 
                optionName="height" 
                label="Height (pixels):" 
                minValue={5} 
                step={5} 
                hasSetButton={false} 
            />;
}

export default HeightConfig;
