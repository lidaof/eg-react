import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures track smooth.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function SmoothConfig(props) {
    return <NumberConfig 
                {...props} 
                optionName="smooth" 
                label="Smooth (pixels):" 
                minValue={0} 
                step={1} 
                hasSetButton={false} 
            />;
}

export default SmoothConfig;
