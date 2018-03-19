import React from 'react';
import PropTypes from 'prop-types';

import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';

import { VISUALIZER_PROP_TYPES } from '../Track';
import Tooltip from '../Tooltip';
import TrackLegend from '../TrackLegend';
import withDefaultOptions from '../withDefaultOptions';

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
    static propTypes = Object.assign({}, VISUALIZER_PROP_TYPES, {
        options: PropTypes.object // Drawing options
    });

    constructor(props) {
        super(props);
        this.state = {
            tooltip: null
        };
        this.drawModel = new LinearDrawingModel(props.viewRegion, props.width);
        this.openTooltip = this.openTooltip.bind(this);
        this.closeTooltip = this.closeTooltip.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.viewRegion !== nextProps.viewRegion || this.props.width !== nextProps.width) {
            this.drawModel = new LinearDrawingModel(nextProps.viewRegion, nextProps.width);
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
        const {trackModel, width, data, viewWindow, options} = this.props;
        const svgStyle = {paddingTop: 5, display: "block", overflow: "visible"};
        return (
        <React.Fragment>
            <svg width={width} height={getTrackHeight(trackModel)} style={svgStyle} >
                <AnnotationArranger
                    data={data}
                    drawModel={this.drawModel}
                    onGeneClick={this.openTooltip}
                    viewWindow={viewWindow}
                    options={options}
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
    visualizer: withDefaultOptions(GeneAnnotationVisualizer, DEFAULT_OPTIONS),
    legend: GeneAnnotationLegend,
    menuItems: [NumRowsConfig, PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: (trackModel) => new MongoSource(new GeneFormatter()),
};

export default GeneAnnotationTrack;
