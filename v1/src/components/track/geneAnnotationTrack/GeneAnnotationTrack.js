import React from 'react';

import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';
import { VISUALIZER_PROP_TYPES } from '../Track';
import { PrimaryColorConfig, BackgroundColorConfig } from '../contextMenu/ColorConfig';

import { GeneFormatter } from '../../../model/Gene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import MongoSource from '../../../dataSources/MongoSource';
import Tooltip from '../Tooltip';

const HEIGHT = 115;
const DEFAULT_OPTIONS = {color: "blue"};

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
        const {trackModel, viewRegion, width, data, leftBoundary, rightBoundary} = this.props;
        const svgStyle = {paddingTop: 5, display: "block", overflow: "visible"};
        return (
        <React.Fragment>
            <svg width={width} height={HEIGHT} style={svgStyle} >
                <AnnotationArranger
                    data={data}
                    drawModel={this.drawModel}
                    onGeneClick={this.openTooltip}
                    leftBoundary={leftBoundary}
                    rightBoundary={rightBoundary}
                    itemColor={trackModel.options.color || DEFAULT_OPTIONS.color}
                    backgroundColor={trackModel.options.backgroundColor}
                />
            </svg>
            {this.state.tooltip}
        </React.Fragment>
        );
    }
}

const GeneAnnotationTrack = {
    visualizer: GeneAnnotationVisualizer,
    menuItems: [PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: (trackModel) => new MongoSource(new GeneFormatter()),
};

export default GeneAnnotationTrack;
