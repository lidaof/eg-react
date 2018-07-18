import React from 'react';
import PropTypes from 'prop-types';

import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../../model/LinearDrawingModel'
import NavigationContext from '../../../model/NavigationContext';
import { niceBpCount } from '../../../util';

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
        const segment = drawModel.xToSegmentCoordinate(x);
        if (NavigationContext.isGapFeature(segment.feature)) {
            return `${niceBpCount(segment.feature.getLength())} gap`;
        } else {
            const locus = segment.getGenomeCoordinates();
            return `${locus.chr}:${Math.floor(locus.start)}`;
        }
    }
}

export default GenomicCoordinates;
