import PropTypes from 'prop-types';
import React from 'react';

const STYLE = {
    width: 250,
    height: 150,
};

/**
 * Box that contains gene details when a gene annotation is clicked.
 * 
 * @author Silas Hsu
 */
class GeneDetail extends React.Component {
    static propTypes = {
        gene: PropTypes.object.isRequired, // The Gene object for which to display info
    };

    render() {
        return <div style={STYLE} >{this.props.gene.getName()}</div>;
    }
}

export default GeneDetail;
