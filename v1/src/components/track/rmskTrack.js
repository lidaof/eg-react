import React from 'react';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale'

import RmskChart from '../RmskChart';
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

const DEFAULT_OPTIONS = { category: rmskCategory, color: rmskCategoryColor};

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
     * @param {RmskChartRecord} record - record whose details to display
     */
    showTooltip(event, record) {
        const {viewRegion, width, trackModel} = this.props;
        const recordValue = record ? record.oneMinusDivergence.toFixed(2) : '(no data)';
        const repClass = record ? record.repClass : '';
        const repFamily = record ? record.repFamily : '';
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
                    <p>Repbase class: {repClass}</p>
                    <p>Repbase family: {repFamily}</p>
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
            <RmskChart
                viewRegion={viewRegion}
                data={data}
                width={width}
                height={this.getHeight()}
                options={DEFAULT_OPTIONS}
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
function RmskLegend(props) {
    const height = props.trackModel.options.height || DEFAULT_HEIGHT;
    let scale = null;
    if (props.data.length > 0) {
        const dataMax = _.maxBy(props.data, record => record.oneMinusDivergence).oneMinusDivergence;
        //const dataMax = Math.max(...props.data.map(record => record.oneMinusDivergence));
        scale = scaleLinear().domain([dataMax, 0]).range([0, height]);
    }
    return <TrackLegend
        trackModel={props.trackModel}
        height={height}
        scaleForAxis={scale}
        style={{paddingTop: TOP_PADDING}}
    />;
}

const RmskTrack = {
    visualizer: rmskVisualizer,
    legend: RmskLegend,
    menuItems: [PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: (trackModel) => new RmskSource(trackModel.url),
};

export default RmskTrack;
