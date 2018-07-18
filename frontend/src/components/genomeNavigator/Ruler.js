import React from 'react';
import PropTypes from 'prop-types';
import TranslatableG from '../TranslatableG';
import RulerDesigner from '../../art/RulerDesigner';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

const RULER_DESIGNER = new RulerDesigner();

/**
 * Draws a ruler that displays feature coordinates.
 * 
 * @author Silas Hsu
 */
class Ruler extends React.PureComponent {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
        width: PropTypes.number.isRequired, // The width of the ruler
        x: PropTypes.number,
        y: PropTypes.number,
    };

    render() {
        const {viewRegion, width, x, y} = this.props;
        return <TranslatableG x={x} y={y} >{RULER_DESIGNER.design(viewRegion, width)}</TranslatableG>;
    }
}

export default Ruler;
