import React from 'react';
import PropTypes from 'prop-types';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel'

/**
 * Calculates genomic coordinates at a page coordinate and displays them.
 * 
 * @author Silas Hsu
 */
class GenomicCoordinates extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        width: PropTypes.number.isRequired,
        x: PropTypes.number.isRequired,
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {viewRegion, width, x} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const genomeCoord = drawModel.xToGenomeCoordinate(x);
        return `${genomeCoord.chr}:${Math.round(genomeCoord.start)}`;
    }
}

export default GenomicCoordinates;
