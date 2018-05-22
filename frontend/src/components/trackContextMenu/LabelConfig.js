import React from 'react';
import SingleInputConfig from './SingleInputConfig';

/**
 * Context menu item for setting track labels.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
export default function LabelConfig(props) {
    return <SingleInputConfig {...props} optionName="label" label="Track label:" hasSetButton={true} />;
}
