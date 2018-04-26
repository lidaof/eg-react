import React from 'react';
import PropTypes from 'prop-types';
import { scaleLinear } from 'd3-scale';

import NewTrack from '../NewTrack';
import BarPlot from './BarPlot';
import TrackLegend from './TrackLegend';
import GenomicCoordinates from './GenomicCoordinates';
import configDataProcessing from './configDataProcessing';

import { RenderTypes } from '../../../art/DesignRenderer';
import NumericalFeatureProcessor from '../../../dataSources/NumericalFeatureProcessor';
import BarRecord from '../../../model/BarRecord';

const TOP_PADDING = 5;
const withDataProcessing = configDataProcessing(new NumericalFeatureProcessor());

/**
 * Track specialized in showing numerical data.
 * 
 * @author Silas Hsu
 */
class NumericalTrack extends React.Component {
    /**
     * Don't forget to look at NumericalFeatureProcessor's propTypes!
     */
    static propTypes = Object.assign({}, NewTrack.trackContainerProps,
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
            displayMode: PropTypes.any // Unused for now
        }).isRequired,
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
            valueToY: scaleLinear().domain([max, min]).range([TOP_PADDING, options.height])
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            valueToY: null
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
        const {height, color} = this.props.options;
        const y = this.state.valueToY(record.value);
        const drawHeight = height - y;
        if (drawHeight <= 0) {
            return null;
        }
        const x = record.xLocation.start;
        const width = record.xLocation.getLength();
        return <rect key={x} x={x} y={y} width={width} height={drawHeight} fill={color} />;
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
        const {trackModel, viewRegion, width} = this.props;
        const record = records[0];
        const recordValue = record ? record.value.toFixed(2) : '(no data)';
        return (
        <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
            <li className="Tooltip-major-text" >{recordValue}</li>
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
            color={options.color} // It doesn't use the color prop, but we pass it to cue rerenders.
            getBarElement={this.renderBarElement}
            getTooltipContents={getTooltipContents || this.renderDefaultTooltip}
        />;
    }

    render() {
        const {trackModel, options} = this.props;
        const legend = <TrackLegend
            trackModel={trackModel}
            height={options.height}
            scaleForAxis={this.state.valueToY}
        />;
        return <NewTrack
            {...this.props}
            legend={legend}
            visualizer={this.renderVisualizer()}
        />;
    }
}

export default withDataProcessing(NumericalTrack);
