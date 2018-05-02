import React from 'react';
import PropTypes from 'prop-types';
import { scaleLinear } from 'd3-scale';

import Track from './Track';
import BarPlot from './BarPlot';
import TrackLegend from './TrackLegend';
import GenomicCoordinates from './GenomicCoordinates';
import configDataProcessing from './configDataProcessing';

import { NumericalDisplayModeConfig } from '../contextMenu/DisplayModeConfig';
import HeightConfig from '../contextMenu/HeightConfig';
import {PrimaryColorConfig, BackgroundColorConfig} from '../contextMenu/ColorConfig';

import { RenderTypes } from '../../../art/DesignRenderer';
import NumericalFeatureProcessor from '../../../dataSources/NumericalFeatureProcessor';
import BarRecord from '../../../model/BarRecord';
import { NumericalDisplayModes } from '../../../model/DisplayModes';

const TOP_PADDING = 5;
const AUTO_HEATMAP_THRESHOLD = 20; // If pixel height is less than this, automatically use heatmap
const withDataProcessing = configDataProcessing(new NumericalFeatureProcessor());

/**
 * Gets the effective display mode of numerical track, taking into account the AUTO and unknown modes.
 * 
 * @param {string} mode - display mode from options object
 * @param {number} height - height of the track
 * @return {string} the effective display mode of the numerical track
 */
function getEffectiveDisplayMode(mode, height) {
    if (mode === NumericalDisplayModes.BAR || mode === NumericalDisplayModes.HEATMAP) {
        return mode;
    } else if (height < AUTO_HEATMAP_THRESHOLD) {
        return NumericalDisplayModes.HEATMAP;
    } else {
        return NumericalDisplayModes.BAR;
    }
}

/**
 * Track specialized in showing numerical data.
 * 
 * @author Silas Hsu
 */
class NumericalTrack extends React.Component {
    /**
     * Don't forget to look at NumericalFeatureProcessor's propTypes!
     */
    static propTypes = Object.assign({}, Track.trackContainerProps,
        {
        /**
         * NumericalFeatureProcessor provides these.  Parents should provide an array of NumericalFeature.
         */
        data: PropTypes.shape({
            /**
             * x-to-record map
             */
            xToRecords: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.instanceOf(BarRecord))).isRequired, 
            min: PropTypes.number.isRequired, // Min record value
            max: PropTypes.number.isRequired, // Max record value
        }).isRequired,
        options: PropTypes.shape({
            height: PropTypes.number.isRequired, // Height of the track
            color: PropTypes.string, // Color to draw bars
            scale: PropTypes.any, // Unused for now
            displayMode: PropTypes.oneOf(Object.values(NumericalDisplayModes))
        }).isRequired,
        unit: PropTypes.string, // Unit to display after the number in tooltips
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
        /**
         * Callback for drawing one bar of a bar chart.  Signature: (record: BarRecord, scale: function): JSX.Element
         *     `record` - data to draw
         *     `scale` - d3 scale function, used to calculate height and y coordinates
         */
        getBarElement: PropTypes.func,
        /**
         * Callback for getting tooltip contents to render whenever a user hovers over the visualization.
         * Signature: (relativeX: number, records: BarRecord[]): JSX.Element
         *     `relativeX` - coordinate of hover relative to the visualizer
         *     `records` - all data that overlap the x location
         */
        getTooltipContents: PropTypes.func,
    });

    /**
     * Gets the scale to use from props.
     * 
     * @param {Object} nextProps - next props the Track will receive
     * @return {Object} next state to merge
     */
    static getDerivedStateFromProps(nextProps) {
        const {data, options} = nextProps;
        const {min, max} = data;
        return {
            effectiveDisplayMode: getEffectiveDisplayMode(options.displayMode, options.height),
            valueToY: scaleLinear().domain([max, min]).range([TOP_PADDING, options.height]),
            valueToOpacity: scaleLinear().domain([min, max]).range([0, 1]),
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            effectiveDisplayMode: NumericalDisplayModes.BAR,
            valueToY: null,
            valueToOpacity: null,
        };
        this.renderBarElement = this.renderBarElement.bind(this);
        this.renderDefaultTooltip = this.renderDefaultTooltip.bind(this);
        this.renderVisualizer = this.renderVisualizer.bind(this);
    }

    /**
     * Renders a default bar element, if the callback for getting a custom one is unspecified.
     * 
     * @param {BarRecord} record - data to draw
     * @return {JSX.Element} bar element to render
     */
    renderDefaultBarElement(record) {
        const {data, height, color} = this.props.options;
        const x = record.xLocation.start;
        const width = record.xLocation.getLength();
        if (this.state.effectiveDisplayMode === NumericalDisplayModes.HEATMAP) {
            const drawHeight = height;
            const opacity = this.state.valueToOpacity(record.value);
            return <rect key={x} x={x} y={0} width={width} height={drawHeight} fill={color} fillOpacity={opacity} />;
        } else { // Assume BAR
            const y = this.state.valueToY(record.value);
            const drawHeight = height - y;
            if (drawHeight <= 0) {
                return null;
            }
            return <rect key={x} x={x} y={y} width={width} height={drawHeight} fill={color} />;
        }
    }

    /**
     * Gets an element to draw for a data record.
     * 
     * @param {BarRecord} record - data to draw
     * @return {JSX.Element} bar element to render
     */
    renderBarElement(record) {
        const getBarElement = this.props.getBarElement;
        if (getBarElement) {
            return getBarElement(record, this.state.valueToY);
        } else { // Render a default bar element
            return this.renderDefaultBarElement(record);
        }
    }

    /**
     * Renders the default tooltip that is displayed on hover.
     * 
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @param {BarRecord[]} records - all data that overlap the x location
     * @return {JSX.Element} tooltip to render
     */
    renderDefaultTooltip(relativeX, records) {
        const {trackModel, viewRegion, width, unit} = this.props;
        const record = records[0];
        const recordValue = record ? record.value.toFixed(2) : '(no data)';
        return (
        <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
            <li>
                <span className="Tooltip-major-text" style={{marginRight: 3}}>{recordValue}</span>
                <span className="Tooltip-minor-text">{unit}</span>
            </li>
            <li className="Tooltip-minor-text" >
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
            </li>
            <li className="Tooltip-minor-text" >{trackModel.getDisplayLabel()}</li>
        </ul>
        );
    }

    /**
     * @return {JSX.Element} visualizer element
     */
    renderVisualizer() {
        const {data, width, options, getTooltipContents} = this.props;
        return <BarPlot
            data={data.xToRecords}
            width={width}
            height={options.height}
            htmlType={RenderTypes.CANVAS}
            color={options.color} // Doesn't use this prop, but we pass it to cue rerenders.
            displayMode={this.state.effectiveDisplayMode} // Doesn't use this prop, but we pass it to cue rerenders.
            getBarElement={this.renderBarElement}
            getTooltipContents={getTooltipContents || this.renderDefaultTooltip}
        />;
    }

    render() {
        const {trackModel, unit, options} = this.props;
        const legend = <TrackLegend
            trackModel={trackModel}
            height={options.height}
            axisScale={this.state.effectiveDisplayMode === NumericalDisplayModes.BAR ? this.state.valueToY : undefined}
            axisLegend={unit}
        />;
        return <Track
            {...this.props}
            legend={legend}
            visualizer={this.renderVisualizer()}
        />;
    }
}

export const SUGGESTED_MENU_ITEMS = [NumericalDisplayModeConfig, HeightConfig, PrimaryColorConfig,
    BackgroundColorConfig];

export default withDataProcessing(NumericalTrack);
