import React from "react";
import NumberConfig from "./NumberConfig";

/**
 * A context menu item that configures track height.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function PixelsPaddingConfig(props) {
    return (
        <NumberConfig
            {...props}
            optionName="pixelsPadding"
            label="Padding drawing tick:"
            minValue={0}
            step={0.1}
            isFloat={true}
            hasSetButton={true}
        />
    );
}

export default PixelsPaddingConfig;
