import React from 'react';
import PropTypes from 'prop-types';
import SingleInputConfig from './SingleInputConfig';

import './TrackContextMenu.css';

/**
 * A menu option that configures some integer-based property.
 * 
 * @author Silas Hsu
 */
class NumberConfig extends React.PureComponent {
    static propTypes = Object.assign({}, SingleInputConfig.menuPropTypes, {
        optionName: PropTypes.string.isRequired, // The prop to change of a TrackModel's options object.
        label: PropTypes.string, // Label of the input
        minValue: PropTypes.number, // Minimum value of the input
        defaultValue: PropTypes.number, // Default value of the input
        isFloat: PropTypes.bool, // Expects a float when truthy, expects an int when falsy
        step: PropTypes.number, // Step attribute; legal number interval
        width: PropTypes.string, // Width of the input element.  Can use CSS units.
        hasSetButton: PropTypes.bool,
    });

    static defaultProps = {
        label: "Number:",
        width: "7ch" // Should be enough for values up to 9999
    };

    constructor(props) {
        super(props);
        this.renderInputElement = this.renderInputElement.bind(this);
        this.handleOptionSet = this.handleOptionSet.bind(this);
    }

    /**
     * Renders the <input> element.
     * 
     * @param {string} inputValue - value of the input
     * @param {function} setNewValue - function to call when input value changes
     * @return {JSX.Element} <input> to render
     */
    renderInputElement(inputValue, setNewValue) {
        const {minValue, step, width} = this.props;
        return <input
            type="number"
            min={minValue}
            step={step}
            value={inputValue}
            style={{width: width}}
            onChange={event => setNewValue(event.target.value)}
        />;
    }

    /**
     * Parses the string containing number from the <input> element.
     * 
     * @param {string} optionName - track option prop name to modify
     * @param {string} value - string containing number from <input> element
     */
    handleOptionSet(optionName, value) {
        let numValue;
        if (this.props.isFloat) {
            numValue = Number.parseFloat(value);
        } else {
            numValue = Number.parseInt(value, 10);
        }
        if (Number.isFinite(numValue)) {
            this.props.onOptionSet(optionName, numValue);
        }
    }

    render() {
        const {optionName, optionsObjects, label, defaultValue, hasSetButton} = this.props;
        const setButton = hasSetButton === undefined ? true : hasSetButton;
        return <SingleInputConfig
            optionName={optionName}
            optionsObjects={optionsObjects}
            label={label}
            defaultValue={defaultValue}
            hasSetButton={setButton}
            getInputElement={this.renderInputElement}
            onOptionSet={this.handleOptionSet}
        />;
    }
}

export default NumberConfig;
