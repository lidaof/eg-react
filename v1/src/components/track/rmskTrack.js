import React from 'react';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale'

import BarChart from '../BarChart';
import { VISUALIZER_PROP_TYPES } from './Track';
import TrackLegend from './TrackLegend';
import Tooltip from './Tooltip';
import GenomicCoordinates from './GenomicCoordinates';
import { PrimaryColorConfig, BackgroundColorConfig } from './contextMenu/ColorConfig';

import RmskSource from '../../dataSources/RmskSource';
import { getRelativeCoordinates, getPageCoordinates } from '../../util';

const DEFAULT_HEIGHT = 35; // In pixels
const TOP_PADDING = 5;
const BAR_CHART_STYLE = {paddingTop: TOP_PADDING, display: "block"}; // display: block prevents extra bottom padding
const DEFAULT_OPTIONS = {color: "blue"};

/**
 * Visualizer for rmsk tracks. 
 * although rmsk uses bigbed as data source, but rmsk has much more contents to be draw so was separated from basic bigbed
 * be aware of bigbed track might also need specify number of columns?
 * 
 * @author Daofeng Li
 */
class rmskVisualizer extends React.PureComponent {
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
        const recordValue = record ? record.value.toFixed(2) : '(no data)';
        const relativeX = getRelativeCoordinates(event).x;
        const pageY = getPageCoordinates(event.currentTarget, 0, this.getHeight()).y;
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={pageY} onClose={this.closeTooltip} >
                <div style={{padding: '0px 5px 5px'}} >
                    <p style={{fontSize: '1.2em', margin: 0}} >{recordValue}</p>
                    <p style={{fontSize: '0.8em', color: 'dimgrey', margin: 0}} >
                        <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
                        <br/>
                        {trackModel.getDisplayLabel()}
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
        const {trackModel, data, viewRegion, width} = this.props;
        //console.log(data);
        return (
        <React.Fragment>
            <BarChart
                viewRegion={viewRegion}
                data={data}
                width={width}
                height={this.getHeight()}
                options={{color: trackModel.options.color || DEFAULT_OPTIONS.color}}
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

/**
 * Legend for rmsk tracks.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 * @author Silas Hsu
 */
function rmskLegend(props) {
    const height = props.trackModel.options.height || DEFAULT_HEIGHT;
    let scale = null;
    if (props.data.length > 0) {
        const dataMax = Math.max(...props.data.map(record => record.value));
        scale = scaleLinear().domain([dataMax, 0]).range([0, height]);
    }
    return <TrackLegend
        trackModel={props.trackModel}
        height={height}
        scaleForAxis={scale}
        style={{paddingTop: TOP_PADDING}}
    />;
}

const rmskTrack = {
    visualizer: rmskVisualizer,
    legend: rmskLegend,
    menuItems: [PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: (trackModel) => new RmskSource(trackModel.url),
};

export default rmskTrack;
