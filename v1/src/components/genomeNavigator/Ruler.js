import React from 'react';
import PropTypes from 'prop-types';
import RulerDesigner from '../../art/RulerDesigner';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

/**
 * Draws a ruler that displays feature coordinates.
 * 
 * @author Silas Hsu
 */
class Ruler extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
        width: PropTypes.number.isRequired, // The drawing model to use
        x: PropTypes.number,
        y: PropTypes.number,
    };

    render() {
        const designer = new RulerDesigner(this.props.viewRegion, this.props.width);
        return <g transform={`translate(${this.props.x || 0} ${this.props.y || 0})`} >{designer.design()}</g>;
    }
}

export default Ruler;
