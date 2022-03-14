import React from "react";
import NumberConfig from "./NumberConfig";

/**
 * A context menu item that configures line width.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function HorizontalLineValueConfig(props) {
    return (
        <NumberConfig
            {...props}
            optionName="horizontalLineValue"
            label="Horizontal line value:"
            hasSetButton={true}
            isFloat={true}
        />
    );
}

export default HorizontalLineValueConfig;
