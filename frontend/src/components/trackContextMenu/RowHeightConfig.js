import React from "react";
import NumberConfig from "./NumberConfig";

/**
 * A context menu item that configures track height.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function RowHeightConfig(props) {
    return (
        <NumberConfig
            {...props}
            optionName="rowHeight"
            label="Row height:"
            minValue={6}
            step={1}
            isFloat={false}
            hasSetButton={true}
        />
    );
}

export default RowHeightConfig;
