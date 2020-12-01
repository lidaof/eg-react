import React from "react";
import SliderConfig from "./SliderConfig";
/**
 * A context menu item that configures track opacity.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function OmeroImageHeightConfig(props) {
    return (
        <SliderConfig
            {...props}
            optionName="imageHeight"
            label="Image height:"
            mode={1}
            step={1}
            domain={[36, 100]}
            values={props.optionsObjects[0].imageHeight}
            onUpdate={() => {}} // Do nothing when updating
        />
    );
}

export default OmeroImageHeightConfig;
