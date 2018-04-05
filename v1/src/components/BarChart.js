import React from 'react'
import PropTypes from 'prop-types';

import DesignRenderer from './DesignRenderer';
import { BarPlotDesigner, BarElementFactory, SimpleBarElementFactory } from '../art/BarPlotDesigner';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
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
        elementFactory: PropTypes.instanceOf(BarElementFactory), // Drawing customizations
        style: PropTypes.object, // CSS
        type: PropTypes.number, // Render element type.  See DesignRenderer.js

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
        this.xToData = [];
    }

    /**
     * Callback for when the mouse is moved over the chart.  Calls the onRecordHover callback.
     * 
     * @param {MouseEvent} event - event that triggered this callback
     */
    mouseMoved(event) {
        const coords = getRelativeCoordinates(event);
        const record = this.xToData[Math.round(coords.x)] || null;
        this.props.onRecordHover(event, record);
    }

    /**
     * @inheritdoc
     */
    render() {
        const {viewRegion, data, width, height, style, type, onMouseLeave} = this.props;
        const elementFactory = this.props.elementFactory || new SimpleBarElementFactory(height);
        const designer = new BarPlotDesigner(viewRegion, width, elementFactory);
        const design = designer.design(data);
        this.xToData = designer.getCoordinateMap();
        return (
        <DesignRenderer
            type={type}
            width={width}
            height={height}
            style={style}
            onMouseMove={this.mouseMoved}
            onMouseLeave={onMouseLeave}
        >
            {design}
        </DesignRenderer>
        );
    }
}

export default BarChart;
