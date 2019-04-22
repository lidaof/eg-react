import React from 'react';
import PropTypes from 'prop-types';

import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../../model/LinearDrawingModel'
import NavigationContext from '../../../model/NavigationContext';

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
        halfRange: PropTypes.number,
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {viewRegion, width, x} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);
        if (this.props.halfRange) {
            const halfWidth = drawModel.basesToXWidth(this.props.halfRange);
            const segmentStart = drawModel.xToSegmentCoordinate(x - halfWidth);
            const segmentEnd = drawModel.xToSegmentCoordinate(x + halfWidth);
            console.log(segmentStart);
            console.log(segmentEnd);
            const locusStart = segmentStart.getLocus();
            const locusEnd = segmentEnd.getLocus();
            return `${locusStart.chr}:${Math.floor(locusStart.start)}-${Math.floor(locusEnd.start)}`;
        }
        else {
            const segment = drawModel.xToSegmentCoordinate(x);
            if (NavigationContext.isGapFeature(segment.feature)) {
                return segment.getName();
            } else {
                const locus = segment.getLocus();
                return `${locus.chr}:${Math.floor(locus.start)}`;
            }
        }
    }
}

export default GenomicCoordinates;
