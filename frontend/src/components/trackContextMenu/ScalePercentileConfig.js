import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures interaction track score scale.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function ScalePercentileConfig(props) {
    return (
        <NumberConfig {...props} 
            optionName="scalePercentile" 
            label="Max Score percentile:" 
            isFloat={true} 
            hasSetButton={true}
            defaultValue={95}
        />
    );
}

export default ScalePercentileConfig;
