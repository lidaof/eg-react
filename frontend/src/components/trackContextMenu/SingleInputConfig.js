import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import aggregateOptions from './aggregateOptions';
import { ITEM_PROP_TYPES } from './TrackContextMenu';

import './TrackContextMenu.css';

const DEBOUNCE_INTERVAL = 250;

/**
 * A context menu item that renders a single element for inputting data.  Sort of a base class for context menu items.
 * 
 * @author Silas Hsu
 */
class SingleInputConfig extends React.PureComponent {
    static propTypes = Object.assign({}, ITEM_PROP_TYPES, {
        optionName: PropTypes.string.isRequired, // Option prop name to read from/write to track models
        label: PropTypes.string.isRequired, // Label for the input
        /**
         * Option value to assume if a track model doesn't contain an option AND its track type doesn't define a default
         */
        defaultValue: PropTypes.any,
        multiValue: PropTypes.any, // Placeholder value if track options don't match
        hasSetButton: PropTypes.bool, // Whether to render a button that says "Set"
        /**
         * Callback for getting an input element to render.
         * Signature (inputValue: any, setNewValue: function): JSX.Element
         *     `inputValue` - value read from tracks, default options, etc.
         *     `setNewValue` - call this function with a new value to dispatch state changes
         */
        getInputElement: PropTypes.func,
    });

    static defaultProps = {
        //optionsObjects: [],
        //onOptionSet: (optionName, value) => undefined,
        defaultValue: "",
        multiValue: "[multiple values]",
        getInputElement: (inputValue, setNewValue) =>
            <input type="text" value={inputValue} onChange={event => setNewValue(event.target.value)} />,
    };

    constructor(props) {
        super(props);
        const {optionsObjects, optionName, defaultValue, multiValue} = props;
        this.state = {
            inputValue: aggregateOptions(optionsObjects, optionName, defaultValue, multiValue)
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.makeOptionSetRequest = _.debounce(this.makeOptionSetRequest.bind(this), DEBOUNCE_INTERVAL);
    }

    /**
     * Re-initalize the input field on prop changes
     * 
     * @param {Object} nextProps - next props as specified by React
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.optionsObjects !== nextProps.optionsObjects) {
            const {optionsObjects, optionName, defaultValue, multiValue} = nextProps;
            this.setState({ inputValue: aggregateOptions(optionsObjects, optionName, defaultValue, multiValue) });
        }
    }

    /**
     * @param {any} newValue - the input's new value
     */
    handleInputChange(newValue) {
        if (!this.props.hasSetButton) {
            this.makeOptionSetRequest(newValue);
        }
        this.setState({inputValue: newValue});
    }

    /**
     * @param {any} newValue - the value with which to make the request
     */
    makeOptionSetRequest(newValue) {
        this.props.onOptionSet(this.props.optionName, newValue);
    }

    render() {
        const {label, hasSetButton, getInputElement} = this.props;
        const inputElement = getInputElement(this.state.inputValue, this.handleInputChange);
        let setButton;
        if (hasSetButton) {
            setButton = <button onClick={() => this.makeOptionSetRequest(this.state.inputValue)} >Set</button>;
        } else {
            setButton = null;
        }

        return (
        <div className="TrackContextMenu-item" >
            <label style={{margin: 0}}>{label} {inputElement} {setButton}</label>
        </div>
        );
    }
}

export default SingleInputConfig;
