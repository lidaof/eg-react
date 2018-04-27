import PropTypes from 'prop-types';
import React from 'react';
import FeatureDetail from '../commonComponents/annotation/FeatureDetail';
import GeneDescription from '../../GeneDescription';
import Gene from '../../../model/Gene';

import '../commonComponents/tooltip/Tooltip.css';

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
        return <div style={{padding: 5, maxWidth: 400}}>
            <FeatureDetail feature={gene} />
            <i><GeneDescription gene={gene} /></i>
        </div>;
    }
}

export default GeneDetail;
