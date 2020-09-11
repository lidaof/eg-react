import React from "react";
import SingleInputConfig from "./SingleInputConfig";

/**
 * Returns a checkbox that configures the fetch view window option for long-range tracks.
 *
 * @param {Object} props - props from track context menu component
 * @return {JSX.Element} the menu item to render
 */
function FetchViewWindowConfig(props) {
    return (
        <SingleInputConfig
            {...props}
            optionName="fetchViewWindowOnly"
            label="Data in current view (no expansion)"
            getInputElement={(inputValue, setNewValue) => (
                <input type="checkbox" checked={inputValue} onChange={(event) => setNewValue(event.target.checked)} />
            )}
        />
    );
}

export default FetchViewWindowConfig;
