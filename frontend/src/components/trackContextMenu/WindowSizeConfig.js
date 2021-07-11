import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures line width.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function WindowSizeConfig(props) {
    return <NumberConfig 
                {...props} 
                optionName="windowSize" 
                label="Window size (pixels):" 
                minValue={1} 
                step={1}
                hasSetButton={true} 
            />;
}

export default WindowSizeConfig;
