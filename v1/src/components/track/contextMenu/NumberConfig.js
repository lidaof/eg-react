import React from 'react';
import PropTypes from 'prop-types';
import { ITEM_PROP_TYPES, ITEM_DEFAULT_PROPS } from './TrackContextMenu';
import { aggregateOptions } from '../subtypeConfig';

import './TrackContextMenu.css';

/**
 * A menu option that configures 
 */
class NumberConfig extends React.PureComponent {
    static propTypes = Object.assign({}, ITEM_PROP_TYPES, {
        optionPropName: PropTypes.string.isRequired, // The prop to change of a TrackModel's options object.
        label: PropTypes.string, // Label of the input
        minValue: PropTypes.number,
    });
    static defaultProps = ITEM_DEFAULT_PROPS;

    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    /**
     * Requests a change in track labels.
     */
    handleInputChange(event) {
        const intValue = Number.parseInt(event.target.value, 10);
        if (Number.isInteger(intValue)) {
            const mutator = trackModel => trackModel.options[this.props.optionPropName] = intValue;
            this.props.onChange(mutator);
        }
    }

    render() {
        const {tracks, optionPropName, label, minValue} = this.props;
        const value = aggregateOptions(tracks, optionPropName, minValue, "");
        return (
        <div className="TrackContextMenu-item" style={{display: "flex", alignItems: "baseline"}} >
            <label style={{paddingRight: '1ch'}}>{label || "Number: "}</label>
            <input type="number" min={minValue} value={value} onChange={this.handleInputChange} />
        </div>
        );
    }
}

export default NumberConfig;
