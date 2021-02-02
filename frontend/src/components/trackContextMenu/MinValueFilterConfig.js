import React from "react";
import NumberConfig from "./NumberConfig";

/**
 * A context menu item that configures track height.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function MinValueFilterConfig(props) {
    return (
        <NumberConfig {...props} optionName="minValueFilter" label="Min value filter:" step={1} hasSetButton={true} />
    );
}

export default MinValueFilterConfig;
