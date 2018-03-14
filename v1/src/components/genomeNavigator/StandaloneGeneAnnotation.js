import React from 'react';
import PropTypes from 'prop-types';

import SvgJsManaged from '../SvgJsManaged';
import { ANNOTATION_HEIGHT, GeneAnnotation } from '../track/geneAnnotationTrack/GeneAnnotation';
import Gene from '../../model/Gene';
import LinearDrawingModel from '../../model/LinearDrawingModel';

/**
 * A SVG containing a happy solo GeneAnnotation.
 * 
 * @author Silas Hsu
 */
class StandaloneGeneAnnotation extends React.PureComponent {
    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // The gene to draw
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Drawing model 
    };
    
    render() {
        const {gene, drawModel} = this.props;
        return (
        <svg width={drawModel.getDrawWidth()} height={ANNOTATION_HEIGHT} >
            <SvgJsManaged><GeneAnnotation gene={gene} drawModel={drawModel} /></SvgJsManaged>
        </svg>
        );
    }
}

export default StandaloneGeneAnnotation;
