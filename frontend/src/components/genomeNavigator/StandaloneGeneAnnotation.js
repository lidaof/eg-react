import React from 'react';
import PropTypes from 'prop-types';

import GeneAnnotation from '../trackVis/geneAnnotationTrack/GeneAnnotation';
import Gene from '../../model/Gene';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

/**
 * A SVG containing a happy solo GeneAnnotation.
 * 
 * @author Silas Hsu
 */
class StandaloneGeneAnnotation extends React.PureComponent {
    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // The gene to draw
        navContextLocation: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Location in nav context
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Drawing model
    };
    
    render() {
        const {gene, navContextLocation, drawModel} = this.props;
        return (
        <svg width={drawModel.getDrawWidth()} height={GeneAnnotation.HEIGHT} >
            <GeneAnnotation gene={gene} navContextLocation={navContextLocation} drawModel={drawModel} isRenderLabel={false}/>
        </svg>
        );
    }
}

export default StandaloneGeneAnnotation;
