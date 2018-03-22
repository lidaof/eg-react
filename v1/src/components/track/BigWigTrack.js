import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale'

import { VISUALIZER_PROP_TYPES } from './Track';
import TrackLegend from './TrackLegend';
import Tooltip from './Tooltip';
import GenomicCoordinates from './GenomicCoordinates';
import withDefaultOptions from './withDefaultOptions';
import { PrimaryColorConfig, BackgroundColorConfig } from './contextMenu/ColorConfig';
import BarChart from '../BarChart';
import { RenderTypes } from '../DesignRenderer';

import BigWigSource from '../../dataSources/BigWigSource';
import { getRelativeCoordinates, getPageCoordinates } from '../../util';

import './Tooltip.css';

const DEFAULT_HEIGHT = 35; // In pixels
const TOP_PADDING = 5;
const BAR_CHART_STYLE = {marginTop: TOP_PADDING};
const DEFAULT_OPTIONS = {color: "blue"};

/**
 * Visualizer for BigWig tracks.
 * 
 * @author Silas Hsu
 */
class BigWigVisualizer extends React.PureComponent {
    static propTypes = Object.assign({}, VISUALIZER_PROP_TYPES, {
        options: PropTypes.object // Drawing options
    });

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
        const recordValue = record ? record.value.toFixed(2) : '(no data)';
        const relativeX = getRelativeCoordinates(event).x;
        const pageY = getPageCoordinates(event.currentTarget, 0, this.getHeight()).y;
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={pageY} style={{padding: '0px 5px 5px'}} onClose={this.closeTooltip} >
                <p className="Tooltip-major-text" >{recordValue}</p>
                <p className="Tooltip-minor-text" >
                    <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
                    <br/>
                    {trackModel.getDisplayLabel()}
                </p>
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
        const {data, viewRegion, width, options} = this.props;
        return (
        <React.Fragment>
            <BarChart
                viewRegion={viewRegion}
                data={data}
                width={width}
                height={this.getHeight()}
                options={options}
                style={BAR_CHART_STYLE}
                type={RenderTypes.CANVAS}
                onRecordHover={this.showTooltip}
                onMouseLeave={this.closeTooltip}
            />
            {this.state.tooltip}
        </React.Fragment>
        );
    }
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
    return <TrackLegend
        trackModel={props.trackModel}
        height={height}
        scaleForAxis={scale}
        style={{paddingTop: TOP_PADDING}}
    />;
}

const BigWigTrack = {
    visualizer: withDefaultOptions(BigWigVisualizer, DEFAULT_OPTIONS),
    legend: BigWigLegend,
    menuItems: [PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: (trackModel) => new BigWigSource(trackModel.url),
};

export default BigWigTrack;
