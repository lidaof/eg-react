import React from 'react';
import { ITEM_PROP_TYPES, ITEM_DEFAULT_PROPS } from './TrackContextMenu';
import ColorPicker from '../../ColorPicker';

class ColorItem extends React.Component {
    static propTypes = ITEM_PROP_TYPES;
    static defaultProps = ITEM_DEFAULT_PROPS;

    constructor(props) {
        super(props);
        this.state = {
            color: '#FFFFFF'
        };
    }

    render() {
        return (
        <div className="TrackContextMenu-item" style={{display: "flex"}}>
            <span style={{paddingRight: '1ch'}}>Color:</span> <ColorPicker color={this.state.color} onChange={color => this.setState({color: color.hex})}/>
        </div>
        );
    }
}

export default ColorItem;
