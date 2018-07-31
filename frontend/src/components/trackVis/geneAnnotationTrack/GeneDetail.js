import PropTypes from 'prop-types';
import React from 'react';
import FeatureDetail from '../commonComponents/annotation/FeatureDetail';
import Gene from '../../../model/Gene';
import { DEFAULT_CATEGORY_COLORS } from './GeneAnnotation';

import '../commonComponents/tooltip/Tooltip.css';

/**
 * Box that contains gene details when a gene annotation is clicked.
 *
 * @author Silas Hsu
 */
class GeneDetail extends React.PureComponent {
    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // The Gene object for which to display info 
        collectionName: PropTypes.string.isRequired
    };

    render() {
        const gene = this.props.gene;
        return <div style={{maxWidth: 400}}>
            <FeatureDetail feature={gene} />
            <i>{gene.description}</i>
            <div>
                {
                gene.transcriptionClass && 
                    <span>
                        Transcription class: <span style={{color:DEFAULT_CATEGORY_COLORS[gene.transcriptionClass]}} >
                        {gene.transcriptionClass}</span>
                    </span>
                }
            </div>
        </div>;
    }
}

export default GeneDetail;
