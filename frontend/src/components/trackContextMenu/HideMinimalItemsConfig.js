import React from "react";
import SingleInputConfig from "./SingleInputConfig";

/**
 * Returns a checkbox that configures if always draw label.
 *
 * @param {Object} props - props from track context menu component
 * @return {JSX.Element} the menu item to render
 */
function HideMinimalItemsConfig(props) {
    return (
        <SingleInputConfig
            {...props}
            optionName="hideMinimalItems"
            label="Hide minimal items"
            getInputElement={(inputValue, setNewValue) => (
                <input type="checkbox" checked={inputValue} onChange={(event) => setNewValue(event.target.checked)} />
            )}
        />
    );
}

export default HideMinimalItemsConfig;
