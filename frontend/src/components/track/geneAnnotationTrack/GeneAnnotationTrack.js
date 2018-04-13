import React from 'react';
import _ from 'lodash';

import GeneDetail from './GeneDetail';

import { VISUALIZER_PROP_TYPES } from '../Track';
import Tooltip from '../commonComponents/Tooltip';
import TrackLegend from '../commonComponents/TrackLegend';
import HiddenItemsMessage from '../commonComponents/HiddenItemsMessage';

import NumberConfig from '../contextMenu/NumberConfig';
import { PrimaryColorConfig, BackgroundColorConfig } from '../contextMenu/ColorConfig';

import Gene from '../../../model/Gene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import MongoSource from '../../../dataSources/MongoSource';
import IntervalArranger from '../../../art/IntervalArranger';
import GeneAnnotation from './GeneAnnotation';
import SvgJsManaged from '../../SvgJsManaged';


const ROW_VERTICAL_PADDING = 5;
const ROW_HEIGHT = GeneAnnotation.HEIGHT + ROW_VERTICAL_PADDING;
const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 10
};

/**
 * Gets the horizontal (left and right) padding required by each gene.  Does this by estimating label width.
 * 
 * @param {Gene} gene - gene to display
 * @return {number} requested horizontal padding
 */
function getHorizontalPadding(gene) {
    return gene.getName().length * GeneAnnotation.HEIGHT;
}

/**
 * Gets the height of the track.
 * 
 * @param {TrackModel} trackModel - track model to use to get height
 * @return {number} height of the track
 */
function getTrackHeight(trackModel) {
    return (trackModel.options.rows || DEFAULT_OPTIONS.rows) * ROW_HEIGHT;
}

/**
 * From the raw data source records, filters out genes too small to see, and calculates absolute coordinates of those
 * that remain.  Returns an object with keys `genes`, which is an array of Genes that survived filtering, and
 * `numHidden`, the the number of genes that were filtered out.
 * 
 * @param {Object[]} records - raw plain-object records
 * @param {Object} trackProps - props passed to Track
 * @return {Object} object with keys `genes` and `numHidden`.  See doc above for details
 */
function processGenes(records, trackProps) {
    const genes = records.map(record => new Gene(record));
    const drawModel = new LinearDrawingModel(trackProps.viewRegion, trackProps.width);
    const navContext = trackProps.viewRegion.getNavigationContext();
    const visibleGenes = genes.filter(gene => drawModel.basesToXWidth(gene.getLength()) >= 1);
    const absCoordGenes = _.flatMap(visibleGenes, gene => gene.computeNavContextCoordinates(navContext));
    return {
        genes: absCoordGenes,
        numHidden: genes.length - visibleGenes.length,
    };
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
        this.openTooltip = this.openTooltip.bind(this);
        this.closeTooltip = this.closeTooltip.bind(this);
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

    renderGenes() {
        const {data, viewRegion, width, viewWindow, options} = this.props;
        const genes = data.genes || [];
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const intervalArranger = new IntervalArranger(drawModel, options.rows - 1, getHorizontalPadding);
        const rows = intervalArranger.arrange(genes);

        return genes.map((gene, i) => {
            const rowIndex = rows[i];
            const isLastRow = rowIndex < 0;
            const effectiveRowIndex = isLastRow ? options.rows - 1 : rowIndex;
            const y = effectiveRowIndex * ROW_HEIGHT;
            return (
            <SvgJsManaged
                key={gene.refGeneRecord._id + gene.absStart}
                transform={`translate(0 ${y})`}
                onClick={event => this.openTooltip(event, gene)}
            >
                <GeneAnnotation
                    gene={gene}
                    isMinimal={isLastRow}
                    drawModel={drawModel}
                    viewWindow={viewWindow}
                    options={options}
                />
            </SvgJsManaged>
            );
        });
    }

    render() {
        const {data, trackModel, width} = this.props;
        const svgStyle = {paddingTop: 5, display: "block", overflow: "visible"};
        return (
        <React.Fragment>
            <svg width={width} height={getTrackHeight(trackModel)} style={svgStyle} >
                {this.renderGenes()}
            </svg>
            {this.state.tooltip}
            <HiddenItemsMessage width={width} numHidden={data.numHidden} />
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
    getDataSource: trackModel => new MongoSource(),
    processData: processGenes,
};

export default GeneAnnotationTrack;
