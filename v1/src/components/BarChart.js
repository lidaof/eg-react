import React from 'react'
import PropTypes from 'prop-types';

import CanvasDesignRenderer from './CanvasDesignRenderer';
import BarChartDesigner from '../art/BarChartDesigner';
import DisplayedRegionModel from '../model/DisplayedRegionModel';

/**
 * Component that renders a bar chart.
 * 
 * @author Silas Hsu
 */
class BarChart extends React.PureComponent {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        data: PropTypes.arrayOf(PropTypes.object).isRequired, // The data to display.  Array of BarChartRecord.
        width: PropTypes.number,
        height: PropTypes.number,
        style: PropTypes.object,
        svg: PropTypes.bool
    };

    /**
     * @inheritdoc
     */
    render() {
        const {viewRegion, data, width, height, style, svg} = this.props;
        const design = new BarChartDesigner(viewRegion, data, width, height).design();
        if (svg) {
            const svgStyle = Object.assign({display: "block"}, style); // Display block to prevent extra bottom margin
            return <svg width={width} height={height} style={svgStyle}>{design}</svg>;
        } else {
            return <CanvasDesignRenderer design={design} width={width} height={height} style={style} />;
        }
    }
}

export default BarChart;
