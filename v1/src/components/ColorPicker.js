import React from 'react';
import PropTypes from 'prop-types';
import { Manager, Target, Popper } from 'react-popper';
import { SketchPicker } from 'react-color';
import OutsideClickDetector from '../../OutsideClickDetector';

const PICKER_OPENER_STYLE = {
    border: '1px solid grey',
    borderRadius: '0.25em',
    width: 50,
    height: '1em',
    marginTop: '0.25em'
};

/**
 * A color picker.
 * 
 * @author Silas Hsu
 */
class ColorPicker extends React.PureComponent {
    static propTypes = {
        color: PropTypes.string, // The color for the picker to display

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
        const pickerOpenerStyle = Object.assign({backgroundColor: this.props.color}, PICKER_OPENER_STYLE);
        const pickerOpener = <div style={pickerOpenerStyle} onClick={this.openPicker} />;

        const pickerElement = (
        <OutsideClickDetector onOutsideClick={this.closePicker}>
            <SketchPicker color={this.props.color} onChangeComplete={this.props.onChange} disableAlpha={true} />
        </OutsideClickDetector>
        );

        return (
        <Manager>
            <Target>{pickerOpener}</Target>
            <Popper placement="bottom" >{this.state.isOpen ? pickerElement : null}</Popper>
        </Manager>
        );
    }
}

export default ColorPicker;
