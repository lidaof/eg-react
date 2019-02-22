import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures marker size for calling card track.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function MarkerSizeConfig(props) {
    return <NumberConfig 
                {...props} 
                optionName="markerSize" 
                label="Marker size:" 
                minValue={1} 
                step={1} 
                hasSetButton={false} 
            />;
}

export default MarkerSizeConfig;
