import React from "react";
import SingleInputConfig from "./SingleInputConfig";

/**
 * Returns a checkbox that configures data with both anchors need be in current view window for long-range tracks.
 *
 * @param {Object} props - props from track context menu component
 * @return {JSX.Element} the menu item to render
 */
function BothAnchorsInViewConfig(props) {
    return (
        <SingleInputConfig
            {...props}
            optionName="bothAnchorsInView"
            label="Both anchors in view window"
            getInputElement={(inputValue, setNewValue) => (
                <input type="checkbox" checked={inputValue} onChange={(event) => setNewValue(event.target.checked)} />
            )}
        />
    );
}

export default BothAnchorsInViewConfig;
