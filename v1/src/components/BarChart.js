import React from 'react'
import PropTypes from 'prop-types';

import CanvasDesignRenderer from './CanvasDesignRenderer';
import BarChartDesigner from '../art/BarChartDesigner';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import { getRelativeCoordinates } from '../util';

/**
 * Component that renders a bar chart graphic.
 * 
 * @author Silas Hsu
 */
class BarChart extends React.PureComponent {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to display
        data: PropTypes.arrayOf(PropTypes.object).isRequired, // The data to display.  Array of BarChartRecord.
        width: PropTypes.number.isRequired, // Graphic width
        height: PropTypes.number.isRequired, // Graphic height
        options: PropTypes.object, // Drawing options.  Will be passed to BarChartDesigner.
        style: PropTypes.object, // CSS
        renderSvg: PropTypes.bool, // Whether to render canvas (default) or svg

        /**
         * Called when the user mouses over the graphic.  Signature
         *     (event: MouseEvent, record: BarChartRecord): void
         *         `event`: the mousemove event that triggered this
         *         `record`: the record that was hovered over, or null if there is no record at this position.
         */
        onRecordHover: PropTypes.func,

        onMouseLeave: PropTypes.func, // Works as one would expect.  Signature: (event: MouseEvent): void
    };

    static defaultProps = {
        renderSvg: false,
        onRecordHover: (event, record) => undefined,
        onMouseLeave: (event) => undefined
    };

    /**
     * Binds event listeners.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.mouseMoved = this.mouseMoved.bind(this);
        this.makeXToDataMap = this.makeXToDataMap.bind(this);
        this.xToData = [];
    }

    /**
     * Callback for when the mouse is moved over the chart.  Calls the onRecordHover callback.
     * 
     * @param {MouseEvent} event - event that triggered this callback
     */
    mouseMoved(event) {
        const coords = getRelativeCoordinates(event);
        const record = this.xToData[coords.x] || null;
        this.props.onRecordHover(event, record);
    }

    /**
     * Makes a map from x coordinates to the max record at the coordinate.  Sets this.xToData.
     */
    makeXToDataMap() {
        const {viewRegion, width, data} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);

        this.xToData = [];
        data.forEach(record => {
            const x = Math.round(drawModel.baseToX(record.start));
            const existingRecord = this.xToData[x];
            if (!existingRecord || record.value > existingRecord.value) {
                this.xToData[x] = record;
            }
        });
    }

    /**
     * @inheritdoc
     */
    render() {
        const {viewRegion, data, width, height, options, style, renderSvg, onMouseLeave} = this.props;
        this.makeXToDataMap();
        const design = new BarChartDesigner(viewRegion, data, width, height, options).design();
        if (renderSvg) {
            const svgStyle = Object.assign({display: "block"}, style); // Display block to prevent extra bottom margin
            return (
            <svg
                width={width}
                height={height}
                style={svgStyle}
                onMouseMove={this.mouseMoved}
                onMouseLeave={onMouseLeave}
            >
                {design}
            </svg>
            );
        } else {
            return (
            <CanvasDesignRenderer
                design={design}
                width={width}
                height={height}
                style={style}
                onMouseMove={this.mouseMoved}
                onMouseLeave={onMouseLeave}
            />);
        }
    }
}

export default BarChart;
