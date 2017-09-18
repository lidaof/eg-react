import PropTypes from 'prop-types';
import React from 'react';

const WIDTH = 300; // In pixels

/**
 * Box that contains gene details when a gene annotation is clicked.
 * 
 * @author Silas Hsu
 */
class GeneDetail extends React.Component {
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

GeneDetail.propTypes = {
    gene: PropTypes.object.isRequired,
    top: PropTypes.number, // CSS property
    left: PropTypes.number, // CSS property
    rightBoundary: PropTypes.number // Limit of the box's right edge
};

GeneDetail.defaultProps = {
    top: 0,
    left: 0,
    rightBoundary: Number.MAX_VALUE,
};
