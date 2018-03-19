import React from 'react';
import PropTypes from 'prop-types';
import ColorPicker from '../../ColorPicker';
import { ITEM_PROP_TYPES, ITEM_DEFAULT_PROPS } from './TrackContextMenu';
import { aggregateOptions } from '../subtypeConfig';

import "./TrackContextMenu.css";

const DEFAULT_COLOR = "#FFFFFF"; // White.  Used if a track doesn't provide a color AND its subtype provides no default.
const MULTIPLE_COLORS = "(multiple values)";

/**
 * A context menu item that configures tracks' colors in general.  Which colors, such as primary or background, is
 * configurable.
 * 
 * @author Silas Hsu
 */
class ColorConfig extends React.PureComponent {
    static propTypes = Object.assign({}, ITEM_PROP_TYPES, {
        optionPropName: PropTypes.string.isRequired, // The prop to change of a TrackModel's options object.
        label: PropTypes.string, // Label of the color picker
    });
    static defaultProps = ITEM_DEFAULT_PROPS;

    constructor(props) {
        super(props);
        this.handleColorChange = this.handleColorChange.bind(this);
    }

    /**
     * Requests that selected tracks change color.  For the shape of the `color` parameter, see
     * http://casesandberg.github.io/react-color/#api-onChange
     * 
     * @param {Object} color - color change object from the `react-color` package
     */
    handleColorChange(color) {
        const replaceTrack = trackModel => trackModel.cloneAndSetOption(this.props.optionPropName, color.hex);
        this.props.onChange(replaceTrack);
    }

    render() {
        const {tracks, optionPropName, label} = this.props;
        const color = aggregateOptions(tracks, optionPropName, DEFAULT_COLOR, MULTIPLE_COLORS);
        return (
        <div className="TrackContextMenu-item" >
            <ColorPicker color={color} label={label} onChange={this.handleColorChange} />
        </div>
        );
    }
}

/**
 * A menu item that configures `trackModel.options.color`
 * 
 * @param {Object} props - object with shape ITEM_PROP_TYPES from TrackContextMenu
 * @return {JSX.Element} element to render
 */
export function PrimaryColorConfig(props) {
    return <ColorConfig {...props} optionPropName="color" label="Primary color" />;
}

/**
 * A menu item that configures `trackModel.options.backgroundColor`
 * 
 * @param {Object} props - object with shape ITEM_PROP_TYPES from TrackContextMenu
 * @return {JSX.Element} element to render
 */
export function BackgroundColorConfig(props) {
    return <ColorConfig {...props} optionPropName="backgroundColor" label="Background color" />;
}
