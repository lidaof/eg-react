import React from 'react';
import PropTypes from 'prop-types';
import { Manager, Target, Popper } from 'react-popper';
import { SketchPicker } from 'react-color';
import parseColor from 'parse-color';

import OutsideClickDetector from './OutsideClickDetector';
import { getContrastingColor } from '../util';

const PICKER_OPENER_STYLE = {
    border: '1px solid grey',
    borderRadius: '0.3em',
    margin: '0.25em',
    padding: '0 5px',
    minWidth: 50,
    minHeight: '1em',
};

/**
 * A color picker.
 * 
 * @author Silas Hsu
 */
class ColorPicker extends React.PureComponent {
    static propTypes = {
        color: PropTypes.string.isRequired, // The color for the picker to display
        label: PropTypes.string, // Label of the picker opener.  If not provided, then displays the color's hex value.

        /**
         * Called when the user picks a color.  See http://casesandberg.github.io/react-color/#api-onChange
         */
        onChange: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
        this.openPicker = this.openPicker.bind(this);
        this.closePicker = this.closePicker.bind(this);
    }

    /**
     * Opens the picker UI.
     */
    openPicker() {
        this.setState({isOpen: true});
    }

    /**
     * Closes the picker UI.
     */
    closePicker() {
        this.setState({isOpen: false});
    }

    /**
     * @inheritdoc
     */
    render() {
        const {color, label, onChange} = this.props;

        const parsedColor = parseColor(color);
        let openerStyle = {
            backgroundColor: color,
            color: getContrastingColor(color)
        };
        Object.assign(openerStyle, PICKER_OPENER_STYLE);

        const pickerOpener = <span style={openerStyle} onClick={this.openPicker} >{label || parsedColor.hex}</span>;
        let pickerElement;
        if (this.state.isOpen) {
            pickerElement = (
                <OutsideClickDetector onOutsideClick={this.closePicker}>
                    <SketchPicker color={color} onChangeComplete={onChange} disableAlpha={true} />
                </OutsideClickDetector>
            );
        } else {
            pickerElement = null;
        }

        return (
        <Manager>
            <Target>{pickerOpener}</Target>
            <Popper placement="bottom" >{pickerElement}</Popper>
        </Manager>
        );
    }
}

export default ColorPicker;
