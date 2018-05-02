import React from 'react';
import SelectConfig from "./SelectConfig";
import { AnnotationDisplayModes } from "../../../model/DisplayModes";

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
