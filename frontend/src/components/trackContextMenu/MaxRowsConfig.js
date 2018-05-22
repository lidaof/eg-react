import React from 'react';
import NumberConfig from './NumberConfig';

/**
 * A context menu item that configures the max number of rows of annotations to render.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function MaxRowsConfig(props) {
    return <NumberConfig {...props} optionName="maxRows" label="Max rows:" minValue={1} />;
}

export default MaxRowsConfig;
