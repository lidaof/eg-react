import React from "react";
import SingleInputConfig from "./SingleInputConfig";

/**
 * Returns a checkbox that controls play/pause of a dynamic track.
 *
 * @param {Object} props - props from track context menu component
 * @return {JSX.Element} the menu item to render
 */
function UseDynamicColorsConfig(props) {
    return (
        <SingleInputConfig
            {...props}
            optionName="useDynamicColors"
            label="Use dynamic colors"
            getInputElement={(inputValue, setNewValue) => (
                <input type="checkbox" checked={inputValue} onChange={(event) => setNewValue(event.target.checked)} />
            )}
        />
    );
}

export default UseDynamicColorsConfig;
