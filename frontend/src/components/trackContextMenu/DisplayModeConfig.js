import React from 'react';
import SelectConfig from './SelectConfig';
import { AnnotationDisplayModes, NumericalDisplayModes, InteractionDisplayMode } from '../../model/DisplayModes';
import NumberConfig from './NumberConfig';

/**
 * A menu item for configuring display modes of annotation tracks.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
export function AnnotationDisplayModeConfig(props) {
    return <SelectConfig
        {...props}
        optionName="displayMode"
        label="Display mode:"
        defaultValue={AnnotationDisplayModes.FULL}
        choices={AnnotationDisplayModes}
    />;
}

/**
 * A menu item for configuring display modes of numerical tracks.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
export function NumericalDisplayModeConfig(props) {
    return <SelectConfig
        {...props}
        optionName="displayMode"
        label="Display mode:"
        defaultValue={NumericalDisplayModes.AUTO}
        choices={NumericalDisplayModes}
    />;
}

export function InteractionDisplayModeConfig(props) {
    const lineWidthConfig = props.optionsObjects[0].displayMode === InteractionDisplayMode.HEATMAP ?
        null : 
        <NumberConfig 
                {...props} 
                optionName="lineWidth" 
                label="Line width (pixels):" 
                minValue={1} 
                step={1} 
                hasSetButton={false} 
            />;
    return <React.Fragment>
        <SelectConfig
            {...props}
            optionName="displayMode"
            label="Display mode:"
            defaultValue={InteractionDisplayMode.HEATMAP}
            choices={InteractionDisplayMode}
        />
        {lineWidthConfig}
    </React.Fragment>
    ;
}
