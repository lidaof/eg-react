import React from 'react';
import { ITEM_PROP_TYPES, ITEM_DEFAULT_PROPS } from './TrackContextMenu';
import { aggregateOptions } from '../subtypeConfig';

import './TrackContextMenu.css';

const OPTION_PROP_NAME = "label";
const MULTI_VALUE_PLACEHOLDER = "[multiple values]";

/**
 * Context menu item for setting track labels.
 * 
 * @author Silas Hsu
 */
class LabelConfig extends React.PureComponent {
    static propTypes = ITEM_PROP_TYPES;
    static defaultProps = ITEM_DEFAULT_PROPS;

    constructor(props) {
        super(props);
        this.state = {
            inputValue: this.initInputValue(props)
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.setButtonPressed = this.setButtonPressed.bind(this);
    }

    /**
     * Gets a string that represents the labels of all the tracks.
     * 
     * @param {Object} props - props as specified by React; contains track objects
     * @return {string} - string that represents the labels of all the tracks
     */
    initInputValue(props) {
        return aggregateOptions(props.tracks, OPTION_PROP_NAME, "", MULTI_VALUE_PLACEHOLDER);
    }

    /**
     * If the tracks have changed, re-initalize the input field
     * 
     * @param {Object} nextProps - next props as specified by React
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.tracks !== nextProps.tracks) {
            this.setState({inputValue: this.initInputValue(nextProps)});
        }
    }

    /**
     * Sets state to the input's value, as this is a controlled component
     * 
     * @param {Event} event - change event
     */
    handleInputChange(event) {
        this.setState({inputValue: event.target.value});
    }

    /**
     * Requests a change in track labels.
     */
    setButtonPressed() {
        const mutator = trackModel => trackModel.options[OPTION_PROP_NAME] = this.state.inputValue;
        this.props.onChange(mutator);
    }

    render() {
        return (
        <div className="TrackContextMenu-item" style={{display: "flex", flexDirection: "column"}} >
            Track label:
            <div style={{display: "flex"}} >
                <input type="text" value={this.state.inputValue} onChange={this.handleInputChange} />
                <button onClick={this.setButtonPressed} >Set</button>
            </div>
        </div>
        );
    }
}

export default LabelConfig;
