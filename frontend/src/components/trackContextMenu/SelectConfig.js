import React from 'react';
import PropTypes from 'prop-types';
import SingleInputConfig from './SingleInputConfig';

const UNKNOWN_VALUE = "Wat is this";

/**
 * Menu item that uses an <select> element.
 * 
 * @author Silas Hsu
 */
class SelectConfig extends React.Component {
    static propTypes = {
        /**
         * <option> choices.  Keys become choice names and values are those passed to the onOptionSet handler.
         */
        choices: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
        defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Default selected choice VALUE

        // For the following, see SingleInputConfig
        optionName: PropTypes.string.isRequired,
        optionsObjects: PropTypes.array,
        label: PropTypes.string,
        onOptionSet: PropTypes.func,
    };

    static defaultProps = {
        defaultValue: UNKNOWN_VALUE,
        onOptionSet: (optionName, value) => undefined
    };

    constructor(props) {
        super(props);
        this.renderInputElement = this.renderInputElement.bind(this);
        this.handleOptionSet = this.handleOptionSet.bind(this);
    }

    /**
     * Renders the <select> element.  If the selected value is the special value of UNKNOWN_VALUE, it renders a special
     * blank <option> for it.
     * 
     * @param {string} inputValue - selected value
     * @param {function} setNewValue - function to call when input value changes
     * @return {JSX.Element} <select> to render
     */
    renderInputElement(inputValue, setNewValue) {
        const choices = this.props.choices;
        let optionElements = [];
        if (inputValue === UNKNOWN_VALUE) {
            optionElements.push(<option key={UNKNOWN_VALUE} value={UNKNOWN_VALUE} />);
        }
        for (let choiceName in choices) {
            const choiceValue = choices[choiceName];
            optionElements.push(<option key={choiceName} value={choiceValue}>{choiceName}</option>);
        }

        return (
        <select value={inputValue} onChange={event => setNewValue(event.target.value)}>
            {optionElements}
        </select>
        );
    }

    /**
     * Calls the parent's onOptionSet handler, but only if the new value is not UNKNOWN_VALUE.
     * 
     * @param {string} optionName - track option prop name to modify
     * @param {string} value - selected value
     */
    handleOptionSet(optionName, newValue) {
        if (newValue === UNKNOWN_VALUE) {
            return;
        } else {
            this.props.onOptionSet(optionName, newValue);
        }
    }

    render() {
        return <SingleInputConfig
            {...this.props}
            multiValue={UNKNOWN_VALUE}
            onOptionSet={this.handleOptionSet}
            getInputElement={this.renderInputElement}
        />;
    }
}

export default SelectConfig;
