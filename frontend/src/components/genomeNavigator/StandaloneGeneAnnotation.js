import React from 'react';
import PropTypes from 'prop-types';

import GeneAnnotation from '../trackVis/geneAnnotationTrack/GeneAnnotation';
import Gene from '../../model/Gene';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import NavigationContext from '../../model/NavigationContext';
import OpenInterval from '../../model/interval/OpenInterval';

/**
 * A SVG containing a happy solo GeneAnnotation.
 * 
 * @author Silas Hsu
 */
class StandaloneGeneAnnotation extends React.PureComponent {
    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // The gene to draw
        navContext: PropTypes.instanceOf(NavigationContext).isRequired,
        contextLocation: PropTypes.instanceOf(OpenInterval).isRequired,
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Drawing model
    };
    
    render() {
        return (
        <svg width={this.props.drawModel.getDrawWidth()} height={GeneAnnotation.HEIGHT} >
            <GeneAnnotation {...this.props} isRenderLabel={false} />
        </svg>
        );
    }
}

export default StandaloneGeneAnnotation;
