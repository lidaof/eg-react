import React from "react";
import NumberConfig from "./NumberConfig";

/**
 * A context menu item that configures track height.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function MaxValueFilterConfig(props) {
    return (
        <NumberConfig {...props} optionName="maxValueFilter" label="Max value filter:" step={1} hasSetButton={true} />
    );
}

export default MaxValueFilterConfig;
