import React from 'react';
import { ITEM_PROP_TYPES, ITEM_DEFAULT_PROPS } from './ContextMenu';

import './ContextMenu.css';

const MULTI_VALUE_PLACEHOLDER = "[multiple values]";

class SetLabelItem extends React.PureComponent {
    static propTypes = ITEM_PROP_TYPES;
    static defaultProps = ITEM_DEFAULT_PROPS;

    constructor(props) {
        super(props);
        this.state = {
            inputValue: this.initInputValue()
        };
        this.inputChanged = this.inputChanged.bind(this);
        this.setButtonPressed = this.setButtonPressed.bind(this);
    }

    initInputValue() {
        const tracks = this.props.tracks;
        if (tracks.length === 0) {
            return "";
        } else if (tracks.length === 1) {
            return tracks[0].name;
        } else {
            const firstName = tracks[0].name;
            if (tracks.every(trackModel => trackModel.name === firstName)) {
                return firstName;
            } else {
                return MULTI_VALUE_PLACEHOLDER;
            }
        }
    }

    inputChanged(event) {
        this.setState({inputValue: event.target.value});
    }

    setButtonPressed() {
        const modifier = trackModel => trackModel.name = this.state.inputValue;
        this.props.onChange(modifier);
    }

    render() {
        return (
        <div className="ContextMenu-item" style={{display: "flex", flexDirection: "column"}} >
            Track label:
            <div style={{display: "flex"}} >
                <input type="text" value={this.state.inputValue} onChange={this.inputChanged} />
                <button onClick={this.setButtonPressed} >Set</button>
            </div>
        </div>
        );
    }
}

export default SetLabelItem;
