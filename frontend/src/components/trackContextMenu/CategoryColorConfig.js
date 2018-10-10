import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ColorPicker from '../ColorPicker';
import { ITEM_PROP_TYPES } from './TrackContextMenu';

import './CategoryColorConfig.css';

const OPTION_NAME = "category";
const COLOR_PROP_NAMES = ["color"];

export class CategoryColorConfig extends React.Component {
    static propTypes = {
        ...ITEM_PROP_TYPES,
        optionsObjects: PropTypes.arrayOf(PropTypes.object).isRequired,
        onOptionSet: PropTypes.func.isRequired,
    };

    getCategoryColors() {
        if (this.props.optionsObjects.length === 1) { // Only return something if there is one track.
            const options = this.props.optionsObjects[0];
            return options ? options[OPTION_NAME] : null;
        } else {
            return null;
        }
    }

    handleColorChange(categoryName, colorPropName, newColor) {
        const categoryColors = this.getCategoryColors();
        const onOptionSet = this.props.onOptionSet;
        if (categoryColors && onOptionSet) {
            const newColors = _.cloneDeep(categoryColors);
            newColors[categoryName][colorPropName] = newColor;
            onOptionSet(OPTION_NAME, newColors);
        }
    }

    render() {
        // Will only return something if there is one and only one track selected
        const categoryColors = this.getCategoryColors(); 
        if (!categoryColors) {
            return null;
        }

        let configs = [];
        for (let categoryName in categoryColors) {
            const config = categoryColors[categoryName];
            const colorPickers = COLOR_PROP_NAMES.map(colorPropName => 
                <ColorPicker
                    key={colorPropName}
                    color={config[colorPropName]}
                    onChange={newColor => this.handleColorChange(categoryName, colorPropName, newColor.hex)}
                />
            );
            configs.push(
                <React.Fragment key={categoryName} >
                    {config.name || categoryName}
                    {colorPickers}
                </React.Fragment>
            );
        }
        return <div className="TrackContextMenu-item">
            <div className="CategoryColorConfig-table">
                <span className="MethylColorConfig-header">Category</span>
                <span className="MethylColorConfig-header">Color</span>
                {configs}
            </div>
            <i>Specify default color for each category in a data hub.</i>
        </div>;
    }
}

export default CategoryColorConfig;
