import React from 'react'
import PropTypes from 'prop-types';

import DesignRenderer from '../../art/DesignRenderer';
import { BarPlotDesigner } from '../../art/BarPlotDesigner';
import { BarElementFactory, SimpleBarElementFactory } from '../../art/BarElementFactory';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import HoverTooltipContext from './HoverTooltipContext';

/**
 * Component that renders a bar chart graphic.
 * 
 * @author Silas Hsu
 */
class BarPlot extends React.PureComponent {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to display
        /**
         * The data to display.  Array of BarPlotRecord.  See BarPlotDesigner.js for details.
         */
        data: PropTypes.arrayOf(PropTypes.object).isRequired, 
        width: PropTypes.number.isRequired, // Graphic width
        height: PropTypes.number.isRequired, // Graphic height
        elementFactory: PropTypes.instanceOf(BarElementFactory), // Drawing customizations to pass to BarPlotDesigner
        style: PropTypes.object, // CSS
        type: PropTypes.number, // Render element type.  See DesignRenderer.js

        /**
         * Called when the user mouses over the graphic.  Should return tooltip contents to render.  Signature
         *     (relativeX: number, record: BarPlotRecord): JSX.Element
         *         `relativeX`: the x coordinate of the mouse hover, relative to the left of the container
         *         `record`: the record that was hovered over, or null if there is no record at this position.
         */
        getTooltipContents: PropTypes.func,
    };

    static defaultProps = {
        getTooltipContents: (relativeX, record) => null
    };

    /**
     * Binds event listeners.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.xToData = [];
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    /**
     * 
     * @param {*} event 
     * @return {JSX.Element}
     */
    getTooltipContents(relativeX) {
        const record = this.xToData[Math.round(relativeX)] || null;
        return this.props.getTooltipContents(relativeX, record);
    }

    /**
     * @inheritdoc
     */
    render() {
        const {viewRegion, data, width, height, style, type} = this.props;
        const elementFactory = this.props.elementFactory || new SimpleBarElementFactory(height);
        const designer = new BarPlotDesigner(viewRegion, width, elementFactory);
        const design = designer.design(data);
        this.xToData = designer.getCoordinateMap();
        return (
        <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.getTooltipContents} >
            <DesignRenderer
                type={type}
                width={width}
                height={height}
                style={style}
            >
                {design}
            </DesignRenderer>
        </HoverTooltipContext>
        );
    }
}

export default BarPlot;
