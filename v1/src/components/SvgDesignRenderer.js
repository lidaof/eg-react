import React from 'react';
import PropTypes from 'prop-types';

/**
 * 
 */
class SvgDesignRenderer extends React.Component {
    static propTypes = {
        design: PropTypes.arrayOf(PropTypes.object), // Array of React.Component compatible with SVG
        x: PropTypes.number, // Horizontal translation of design; positive numbers = right
        y: PropTypes.number // Vertical translation of design; positive numbers = downwards
    };

    render() {
        return <g transform={`translate(${this.props.x || 0} ${this.props.y || 0})`}>{this.props.design}</g>;
    }
}

export default SvgDesignRenderer;
