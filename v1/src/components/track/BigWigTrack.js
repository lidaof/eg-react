import React from 'react';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';

import { VISUALIZER_PROP_TYPES } from './Track';
import TrackLegend from './TrackLegend';
import Tooltip from './Tooltip';
import GenomicCoordinates from './GenomicCoordinates';
import { PrimaryColorConfig, BackgroundColorConfig } from './contextMenu/ColorConfig';
import BarChart from '../BarChart';
import { RenderTypes } from '../DesignRenderer';

import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import DataFormatter from '../../dataSources/DataFormatter';
import { BarPlotRecord, SimpleBarElementFactory } from '../../art/BarPlotDesigner';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import { getRelativeCoordinates, getPageCoordinates } from '../../util';

import './Tooltip.css';

const TOP_PADDING = 5;
const BAR_CHART_STYLE = {marginTop: TOP_PADDING};
const DEFAULT_OPTIONS = {
    height: 35,
    color: "blue"
};

/*
Expected DASFeature schema

interface DASFeature {
    max: number; // Chromosome base number, end
    maxScore: number;
    min: number; // Chromosome base number, start
    score: number; // Value at the location
    segment: string; // Chromosome name
    type: string;
    _chromId: number
}
*/
class BarChartFormatter extends DataFormatter {
    format(data) {
        return data.map(feature =>
            new BarPlotRecord(new ChromosomeInterval(feature.segment, feature.min, feature.max), feature.score)
        );
    }
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
            elementFactory: new SimpleBarElementFactory(props.options.height, props.options),
            tooltip: null
        };
        this.showTooltip = this.showTooltip.bind(this);
        this.closeTooltip = this.closeTooltip.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.options !== nextProps.options) {
            this.setState({elementFactory: new SimpleBarElementFactory(nextProps.options.height, nextProps.options)});
        }
    }

    /**
     * Sets state to show a tooltip displaying a record's details.
     * 
     * @param {MouseEvent} event - mouse event for positioning hints
     * @param {BarChartRecord} record - record whose details to display
     */
    showTooltip(event, record) {
        const {viewRegion, width, trackModel, options} = this.props;
        const recordValue = record ? record.value.toFixed(2) : '(no data)';
        const relativeX = getRelativeCoordinates(event).x;
        const pageY = getPageCoordinates(event.currentTarget, 0, options.height).y;
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
                height={options.height}
                elementFactory={this.state.elementFactory}
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
    const height = props.options.height;
    let scale = null;
    if (props.data.length > 0) {
        const dataMax = _.maxBy(props.data, 'value').value;
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
    visualizer: BigWigVisualizer,
    legend: BigWigLegend,
    menuItems: [PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: (trackModel) => new BigWigOrBedSource(trackModel.url, new BarChartFormatter()),
};

export default BigWigTrack;
