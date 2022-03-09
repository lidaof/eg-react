import React from "react";
import SingleInputConfig from "./SingleInputConfig";

/**
 * Returns a checkbox that configures the combine strands option of methylC tracks.
 *
 * @param {Object} props - props from track context menu component
 * @return {JSX.Element} the menu item to render
 */
function ShowHorizontalLineConfig(props) {
    return (
        <SingleInputConfig
            {...props}
            optionName="showHorizontalLine"
            label="Horizontal line"
            getInputElement={(inputValue, setNewValue) => (
                <input type="checkbox" checked={inputValue} onChange={(event) => setNewValue(event.target.checked)} />
            )}
        />
    );
}

export default ShowHorizontalLineConfig;
