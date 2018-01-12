import React from 'react';
import PropTypes from 'prop-types';

const HEIGHT = 60;

/**
 * Creates and manages the boxes that the user can drag across the screen to select a new region.
 * 
 * @author Silas Hsu
 */
class SelectionBox extends React.Component {
    static propTypes = {
        x1: PropTypes.number.isRequired, // One x coordinate of the box
        x2: PropTypes.number.isRequired, // The other x coordinate of the box.
        y: PropTypes.number,
    };

    /**
     * @inheritdoc
     */
    render() {
        const x = Math.min(this.props.x1, this.props.x2);
        const width = Math.abs(this.props.x1 - this.props.x2);
        return <rect
            x={x}
            y={this.props.y || 0}
            z={1}
            width={width}
            height={HEIGHT}
            style={{stroke: "#009", fill: "#00f", fillOpacity: 0.1}}
        />
    }
}

export default SelectionBox;
