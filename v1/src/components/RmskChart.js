import React from 'react'
import PropTypes from 'prop-types';

import CanvasDesignRenderer from './CanvasDesignRenderer';
import BarChartDesigner from '../art/BarChartDesigner';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import { getRelativeCoordinates } from '../util';

const rmskCategory = {
    "DNA":4,
    "DNA?":4,
    "LINE":2,
    "LINE?":2,
    "Low_complexity":7,
    "LTR":3,
    "LTR?":3,
    "Other":9,
    "RC":4,
    "RC?":4,
    "RNA":8,
    "rRNA":8,
    "Satellite":6,
    "Satellite?":6,
    "scRNA":8,
    "Simple_repeat":5,
    "SINE":1,
    "SINE?":1,
    "snRNA":8,
    "srpRNA":8,
    "tRNA":8,
    "ncRNA":8,
    "Unknown":10,
    "Unknown?":10,
    "Retroposon":11,
    "Retrotransposon":11,
    "ARTEFACT":12,
}

const rmskCategoryColor = {
    1:["SINE - short interspersed nuclear elements","#cc0000"],
    2:["LINE - long interspersed nuclear element","#FF6600"],
    3:["LTR - long terminal repeat element","#006600"],
    4:["DNA transposon","#4A72E8"],
    5:["Simple repeat, micro-satellite","#AB833B"],
    6:["Satellite repeat","#660000"],
    7:["Low complexity repeat","#663333"],
    8:["RNA repeat","#cc33ff"],
    9:["Other repeats","#488E8E"],
    10:["Unknown","#5C5C5C"],
    11:["Retroposon","#EA53C4"],
    12:["ARTEFACT","#00FFAA"],
}


/**
 * Component that renders a bar chart graphic.
 * 
 * @author Daofeng Li modified from Silas Hsu's BarChart
 */
class BarChart extends React.PureComponent {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to display
        data: PropTypes.arrayOf(PropTypes.object).isRequired, // The data to display.  Array of Rmsk.
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
