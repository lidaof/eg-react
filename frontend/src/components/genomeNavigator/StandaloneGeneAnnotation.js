import React from 'react';
import PropTypes from 'prop-types';

import GeneAnnotation from '../track/geneAnnotationTrack/GeneAnnotation';
import Gene from '../../model/Gene';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import OpenInterval from '../../model/interval/OpenInterval';

/**
 * A SVG containing a happy solo GeneAnnotation.
 * 
 * @author Silas Hsu
 */
class StandaloneGeneAnnotation extends React.PureComponent {
    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // The gene to draw
        absLocation: PropTypes.instanceOf(OpenInterval).isRequired, // Location of the gene in nav context coordinates
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Drawing model
    };
    
    render() {
        const {gene, absLocation, drawModel} = this.props;
        return (
        <svg width={drawModel.getDrawWidth()} height={GeneAnnotation.HEIGHT} >
            <GeneAnnotation gene={gene} absLocation={absLocation} drawModel={drawModel} />
        </svg>
        );
    }
}

export default StandaloneGeneAnnotation;
