import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures max methyl value for methylc track.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function MaxMethylAndDepthFilterConfig(props) {
    return (
        <React.Fragment>
            <NumberConfig {...props} 
            optionName="maxMethyl" 
            label="Methylation value max:" 
            isFloat={true}
            defaultValue={1}
            step={0.1}
            minValue={0}
            hasSetButton={true} // when type 0.5 before you type 5 browser trying to set the scale and get fail
            />
            <NumberConfig {...props} 
                optionName="depthFilter" 
                label="Depth filter:" 
                isFloat={false}
                defaultValue={0}
                minValue={0}
                hasSetButton={true} // when type 0.5 before you type 5 browser trying to set the scale and get fail
            />
        </React.Fragment>
    );
}

export default MaxMethylAndDepthFilterConfig;
