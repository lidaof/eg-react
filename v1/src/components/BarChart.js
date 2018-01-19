import React from 'react'
import PropTypes from 'prop-types';
import _ from 'lodash';

import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';

/**
 * Component takes a SVG and renders a bar chart on it.
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
    };

    /**
     * Draws the data.
     */
    componentDidMount() {
        this.draw(this.canvasNode);
    }

    /**
     * Redraws the data.
     */
    componentDidUpdate(prevProps) {
        this.draw(this.canvasNode);
    }

    /**
     * Draws the data.
     */
    draw(canvas) {
        if (process.env.NODE_ENV === "test") {
            return;
        }

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const context = canvas.getContext("2d");
        context.fillStyle = "blue";
        context.clearRect(0, 0, canvas.width, canvasHeight);

        const data = this.props.data;
        const non0Data = data.filter(record => record.value !== 0);
        if (non0Data.length === 0) {
            return;
        }
        const dataMax = _.maxBy(data, record => record.value).value;
        
        const drawModel = new LinearDrawingModel(this.props.viewRegion, canvasWidth);
        non0Data.forEach(record => {
            const x = Math.round(drawModel.baseToX(record.start));
            const y = Math.round(canvasHeight - (record.value/dataMax * canvasHeight));
            const width = 1;
            const height = Math.round(record.value/dataMax * canvasHeight);
            context.fillRect(x, y, width, height);
        });
    }

    /**
     * @inheritdoc
     */
    render() {
        return (
        <canvas
            width={this.props.width}
            height={this.props.height}
            style={this.props.style}
            ref={node => this.canvasNode = node}>
        </canvas>
        );
    }
}

export default BarChart;
