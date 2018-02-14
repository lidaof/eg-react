import React from 'react';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale'

import BarChart from '../BarChart';
import { VISUALIZER_PROP_TYPES } from './Track';
import TrackLegend from './TrackLegend';
import Tooltip from './Tooltip';
import GenomicCoordinates from './GenomicCoordinates';

import BigWigSource from '../../dataSources/BigWigSource';
import { getRelativeCoordinates } from '../../util';

const DEFAULT_HEIGHT = 30; // In pixels
const TOP_MARGIN = 5;
const BAR_CHART_STYLE = {marginTop: TOP_MARGIN, display: "block"}; // display: block to prevent extra bottom padding

/**
 * Rounds to some number of digits after the decimal point.  For example, roundWithPrecision(12.3456, 2) = 12.34
 * 
 * @param {number} number - the number to round
 * @param {number} precision - the number of digits to keep after the decimal point
 * @return {number} the rounded number
 */
function roundWithPecision(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

/**
 * Legend for BigWig tracks.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 * @author Silas Hsu
 */
function BigWigLegend(props) {
    const height = props.trackModel.options.height || DEFAULT_HEIGHT;
    let scale = null;
    if (props.data.length > 0) {
        const dataMax = _.maxBy(props.data, record => record.value).value;
        scale = scaleLinear().domain([dataMax, 0]).range([0, height]);
    }
    return <div style={{marginTop: TOP_MARGIN}}>
        <TrackLegend trackModel={props.trackModel} scaleForAxis={scale} height={height} />
    </div>;
}

/**
 * Visualizer for BigWig tracks.
 * 
 * @author Silas Hsu
 */
class BigWigVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            tooltip: null
        };
        this.showTooltip = this.showTooltip.bind(this);
        this.closeTooltip = this.closeTooltip.bind(this);
    }

    /**
     * @return {number} the height at which the visualizer should render
     */
    getHeight() {
        return this.props.trackModel.options.height || DEFAULT_HEIGHT;
    }

    /**
     * Sets state to show a tooltip displaying a record's details.
     * 
     * @param {MouseEvent} event - mouse event for positioning hints
     * @param {BarChartRecord} record - record whose details to display
     */
    showTooltip(event, record) {
        const {viewRegion, width, trackModel} = this.props;
        const recordValue = record ? roundWithPecision(record.value, 2) : 0;
        const x = getRelativeCoordinates(event).x;
        const tooltip = (
            <Tooltip relativeTo={event.currentTarget} x={x} y={this.getHeight()} onClose={this.closeTooltip} >
                <div style={{padding: '0px 5px 5px'}} >
                    <p style={{fontSize: '1.2em', margin: 0}} >{recordValue}</p>
                    <p style={{fontSize: '0.8em', color: 'dimgrey', margin: 0}} >
                        <GenomicCoordinates viewRegion={viewRegion} width={width} x={x} />
                        <br/>
                        {trackModel.name}
                    </p>
                </div>
            </Tooltip>
        );
        this.setState({tooltip: tooltip});
    }

    /**
     * Sets state to stop showing any tooltips.
     */
    closeTooltip() {
        this.setState({tooltip: null});
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {data, viewRegion, width} = this.props;
        return (
        <React.Fragment>
            <BarChart
                viewRegion={viewRegion}
                data={data}
                width={width}
                height={this.getHeight()}
                style={BAR_CHART_STYLE}
                renderSvg={false}
                onRecordHover={this.showTooltip}
                onMouseLeave={this.closeTooltip}
            />
            {this.state.tooltip}
        </React.Fragment>
        );
    }
}

const BigWigTrack = {
    getDataSource: (trackModel) => new BigWigSource(trackModel.url),
    legend: BigWigLegend,
    visualizer: BigWigVisualizer
};

export default BigWigTrack;
