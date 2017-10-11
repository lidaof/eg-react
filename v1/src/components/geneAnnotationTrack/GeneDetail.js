import PropTypes from 'prop-types';
import React from 'react';

const WIDTH = 300; // In pixels

/**
 * Box that contains gene details when a gene annotation is clicked.
 * 
 * @author Silas Hsu
 */
class GeneDetail extends React.Component {
    static propTypes = {
        gene: PropTypes.object.isRequired, // The Gene object for which to display info
        top: PropTypes.number, // CSS property for positioning, as this component follows absolute positioning
        left: PropTypes.number, // CSS property, as this component follows absolute positioning
        rightBoundary: PropTypes.number // Limit of the box's right edge, as an X pixel coordinate
    };

    static defaultProps = {
        top: 0,
        left: 0,
        rightBoundary: Number.MAX_VALUE, // In effect, no right boundary.
    };

    render() {
        return (
        <div
            style={{
                position: "absolute",
                left: Math.min(this.props.left, this.props.rightBoundary - WIDTH),
                top: this.props.top,
                zIndex: 1,
                border: "1px solid black",
                width: WIDTH + "px",
                height: "200px",
                background: "white"
            }}
        >
            <p>{this.props.gene.name}</p>
        </div>
        )
    }
}

export default GeneDetail;
