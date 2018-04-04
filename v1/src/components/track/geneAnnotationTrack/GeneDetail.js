import PropTypes from 'prop-types';
import React from 'react';
import GeneDescription from '../../GeneDescription';
import Gene from '../../../model/Gene';

const STYLE = {
    width: 250,
    height: 150,
};

/**
 * Box that contains gene details when a gene annotation is clicked.
 * 
 * @author Silas Hsu
 */
class GeneDetail extends React.PureComponent {
    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // The Gene object for which to display info
    };

    render() {
        const gene = this.props.gene;
        return <div style={STYLE} >
            {gene.getName()}
            <p><GeneDescription gene={gene} /></p>
        </div>;
    }
}

export default GeneDetail;
