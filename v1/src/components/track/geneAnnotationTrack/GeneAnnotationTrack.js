import React from 'react';

import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';

import { VISUALIZER_PROP_TYPES } from '../Track';
import Tooltip from '../Tooltip';
import TrackLegend from '../TrackLegend';

import NumberConfig from '../contextMenu/NumberConfig';
import { PrimaryColorConfig, BackgroundColorConfig } from '../contextMenu/ColorConfig';

import Gene from '../../../model/Gene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import MongoSource from '../../../dataSources/MongoSource';
import DataFormatter from '../../../dataSources/DataFormatter';

const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 7
};

function getTrackHeight(trackModel) {
    return (trackModel.options.rows || DEFAULT_OPTIONS.rows) * AnnotationArranger.HEIGHT_PER_ROW;
}

class GeneFormatter extends DataFormatter {
    format(data) {
        return data.map(record => new Gene(record));
    }
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
        const {trackModel, data, viewRegion, width, viewWindow, options} = this.props;
        const svgStyle = {paddingTop: 5, display: "block", overflow: "visible"};
        return (
        <React.Fragment>
            <svg width={width} height={getTrackHeight(trackModel)} style={svgStyle} >
                <AnnotationArranger
                    viewRegion={viewRegion}
                    drawModel={this.drawModel}
                    data={data}
                    viewWindow={viewWindow}
                    options={options}
                    onGeneClick={this.openTooltip}
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
