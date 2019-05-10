import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures line width.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function LineWidthConfig(props) {
    return <NumberConfig 
                {...props} 
                optionName="lineWidth" 
                label="Line width (pixels):" 
                minValue={1} 
                step={1} 
                hasSetButton={false} 
            />;
}

export default LineWidthConfig;
