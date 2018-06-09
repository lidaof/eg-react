import React from 'react';
import PropTypes from 'prop-types';
import SingleInputConfig from './SingleInputConfig';
import ColorPicker from '../ColorPicker';

import "./TrackContextMenu.css";

const DEFAULT_COLOR = "#FFFFFF"; // White

/**
 * A context menu item that configures tracks' colors in general.
 * 
 * @author Silas Hsu
 */
export class ColorConfig extends React.PureComponent {
    static propTypes = Object.assign({}, SingleInputConfig.menuPropTypes, {
        optionName: PropTypes.string.isRequired, // The prop to change of a TrackModel's options object.
        label: PropTypes.string, // Label of the color picker
    });

    constructor(props) {
        super(props);
        this.renderColorPicker = this.renderColorPicker.bind(this);
    }

    /**
     * Renders a color picker.  For the shape of the `color` parameter in the onChange handler, see
     * http://casesandberg.github.io/react-color/#api-onChange
     * 
     * @param {*} inputValue 
     * @param {*} setNewValue 
     * @return {JSX.Element}
     */
    renderColorPicker(inputValue, setNewValue) {
        return <ColorPicker color={inputValue} label={this.props.label} onChange={color => setNewValue(color.hex)} />;
    }

    render() {
        return <SingleInputConfig
            {...this.props}
            optionName={this.props.optionName}
            label=""
            defaultValue={DEFAULT_COLOR}
            getInputElement={this.renderColorPicker}
        />;
    }
}

/**
 * A menu item that configures `trackModel.options.color`
 * 
 * @param {Object} props - object with shape ITEM_PROP_TYPES from TrackContextMenu
 * @return {JSX.Element} element to render
 */
export function PrimaryColorConfig(props) {
    return <ColorConfig {...props} optionName="color" label="Primary color" />;
}

/**
 * A menu item that configures `trackModel.options.color2`
 * 
 * @param {Object} props - object with shape ITEM_PROP_TYPES from TrackContextMenu
 * @return {JSX.Element} element to render
 */
export function SecondaryColorConfig(props) {
    return <ColorConfig {...props} optionName="color2" label="Secondary color" />;
}

/**
 * A menu item that configures `trackModel.options.backgroundColor`
 * 
 * @param {Object} props - object with shape ITEM_PROP_TYPES from TrackContextMenu
 * @return {JSX.Element} element to render
 */
export function BackgroundColorConfig(props) {
    return <ColorConfig {...props} optionName="backgroundColor" label="Background color" />;
}
