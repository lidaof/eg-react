import React from "react";
import SliderConfig from "./SliderConfig";
/**
 * A context menu item that configures track opacity.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 */
function SpeedConfig(props) {
    return (
        <SliderConfig
            {...props}
            optionName="speed"
            label="Play speed:"
            mode={1}
            step={1}
            domain={[1, 10]}
            values={props.optionsObjects[0].speed}
            onUpdate={() => {}} // Do nothing when updating
        />
    );
}

export default SpeedConfig;
