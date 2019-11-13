import React from 'react';
import SingleInputConfig from './SingleInputConfig';

/**
 * Returns a checkbox that configures the combine strands option of methylC tracks.
 *
 * @param {Object} props - props from track context menu component
 * @return {JSX.Element} the menu item to render
 */
function G3dShowChromLabelsConfig(props) {
    return (
        <SingleInputConfig
            {...props}
            optionName="showChromLabels"
            label="Show chrom labels"
            defaultValue={true}
            getInputElement={(inputValue, setNewValue) => (
                <input type="checkbox" checked={inputValue} onChange={event => setNewValue(event.target.checked)} />
            )}
        />
    );
}

export default G3dShowChromLabelsConfig;
