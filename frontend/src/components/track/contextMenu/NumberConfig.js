import React from 'react';
import PropTypes from 'prop-types';
import { ITEM_PROP_TYPES, ITEM_DEFAULT_PROPS } from './TrackContextMenu';
import { aggregateOptions } from '../subtypeConfig';

import './TrackContextMenu.css';
import SingleInputConfig from './SingleInputConfig';

/**
 * A menu option that configures some integer-based property.
 * 
 * @author Silas Hsu
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
            const trackReplacer = trackModel => trackModel.cloneAndSetOption(this.props.optionPropName, intValue);
            this.props.onChange(trackReplacer);
        }
    }

    render() {
        const {tracks, optionPropName, label, minValue} = this.props;
        const value = aggregateOptions(tracks, optionPropName, minValue, "");
        const inputElement = <input
            type="number"
            style={{width: "10ch"}}
            min={minValue} value={value}
            onChange={this.handleInputChange}
        />;
        return <SingleInputConfig label={label || "Number:"} inputElement={inputElement} />;
    }
}

export default NumberConfig;
