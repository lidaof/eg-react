import React from 'react';

import { VISUALIZER_PROP_TYPES } from '../Track';
import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';
import Tooltip from '../Tooltip';
import TrackLegend from '../TrackLegend';

import NumberConfig from '../contextMenu/NumberConfig';
import { PrimaryColorConfig, BackgroundColorConfig } from '../contextMenu/ColorConfig';

import { GeneFormatter } from '../../../model/Gene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import MongoSource from '../../../dataSources/MongoSource';

const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 7
};

function getTrackHeight(trackModel) {
    return (trackModel.options.rows || DEFAULT_OPTIONS.rows) * AnnotationArranger.HEIGHT_PER_ROW;
}

/**
 * A gene annotation visualizer.
 * 
 * @author Silas Hsu
 */
class GeneAnnotationVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    constructor(props) {
        super(props);
        this.state = {
            tooltip: null
        };
        this.options = Object.assign({}, DEFAULT_OPTIONS, props.trackModel.options);
        this.drawModel = new LinearDrawingModel(props.viewRegion, props.width);
        this.openTooltip = this.openTooltip.bind(this);
        this.closeTooltip = this.closeTooltip.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.viewRegion !== nextProps.viewRegion || this.props.width !== nextProps.width) {
            this.drawModel = new LinearDrawingModel(nextProps.viewRegion, nextProps.width);
        }
        if (this.props.trackModel !== nextProps.trackModel) {
            this.options = Object.assign({}, DEFAULT_OPTIONS, nextProps.trackModel.options);
        }
    }

    /**
     * Called when a gene annotation is clicked.  Sets state so a detail box is displayed.
     * 
     * @param {MouseEvent} event 
     * @param {Gene} gene 
     */
    openTooltip(event, gene) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.closeTooltip} >
                <GeneDetail gene={gene} />
            </Tooltip>
        );
        this.setState({tooltip: tooltip});
    }
    
    closeTooltip() {
        this.setState({tooltip: null});
    }

    render() {
        const {trackModel, width, data, viewWindow} = this.props;
        const svgStyle = {paddingTop: 5, display: "block", overflow: "visible"};
        return (
        <React.Fragment>
            <svg width={width} height={getTrackHeight(trackModel)} style={svgStyle} >
                <AnnotationArranger
                    data={data}
                    drawModel={this.drawModel}
                    onGeneClick={this.openTooltip}
                    viewWindow={viewWindow}
                    options={this.options}
                />
            </svg>
            {this.state.tooltip}
        </React.Fragment>
        );
    }
}

function GeneAnnotationLegend(props) {
    return <TrackLegend height={getTrackHeight(props.trackModel)} {...props} />
}

function NumRowsConfig(props) {
    return <NumberConfig {...props} optionPropName="rows" label="Rows to draw: " minValue={1} />
}

const GeneAnnotationTrack = {
    visualizer: GeneAnnotationVisualizer,
    legend: GeneAnnotationLegend,
    menuItems: [NumRowsConfig, PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: (trackModel) => new MongoSource(new GeneFormatter()),
};

export default GeneAnnotationTrack;
