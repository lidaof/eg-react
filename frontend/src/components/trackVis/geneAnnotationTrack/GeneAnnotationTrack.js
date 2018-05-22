import React from 'react';
import PropTypes from 'prop-types';

import GeneAnnotation from './GeneAnnotation';
import GeneDetail from './GeneDetail';

import Track from '../commonComponents/Track';
import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import withTooltip from '../commonComponents/tooltip/withTooltip';
import Tooltip from '../commonComponents/tooltip/Tooltip';

import LinearDrawingModel from '../../../model/LinearDrawingModel';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import IntervalArranger from '../../../model/interval/IntervalArranger';

const ROW_VERTICAL_PADDING = 5;
const ROW_HEIGHT = GeneAnnotation.HEIGHT + ROW_VERTICAL_PADDING;
const INTERVAL_ARRANGER = new IntervalArranger(
    drawLocation => drawLocation.feature.getName().length * GeneAnnotation.HEIGHT
);

/**
 * Track that displays gene annotations.
 * 
 * @author Silas Hsu
 */
class GeneAnnotationTrack extends React.Component {
    static propTypes = Object.assign({},
        Track.trackContainerProps,
        withTooltip.INJECTED_PROPS,
        {
        // Genes to render
        data: PropTypes.array.isRequired, //PropTypes.arrayOf(PropTypes.instanceOf(Gene)).isRequired,
        }
    );

    static defaultProps = {
        options: {},
        onShowTooltip: element => undefined,
        onHideTooltip: () => undefined,
    };

    constructor(props) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    /**
     * Renders one gene annotation.
     * 
     * @param {Gene} gene - gene to render
     * @param {OpenInterval} absInterval - location of the gene in navigation context
     * @param {OpenInterval} xRange - x coordinates the annotation will occupy
     * @param {number} y - y coordinate of the top of the annotation
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @return {JSX.Element} element visualizing the gene
     */
    renderAnnotation(gene, absInterval, xRange, y, isLastRow) {
        const {viewRegion, width, viewWindow, options} = this.props;
        const navContext = viewRegion.getNavigationContext();
        const drawModel = new LinearDrawingModel(viewRegion, width);
        return <GeneAnnotation
            key={gene.refGeneRecord._id}
            gene={gene}
            navContextLocation={new DisplayedRegionModel(navContext, ...absInterval)}
            drawModel={drawModel}
            y={y}
            viewWindow={viewWindow}
            isMinimal={isLastRow}
            options={options}
            onClick={this.renderTooltip}
        />;
    }

    /**
     * Renders the tooltip for a gene.
     * 
     * @param {MouseEvent} event - mouse event that triggered the tooltip request
     * @param {Gene} gene - gene for which to display details
     */
    renderTooltip(event, gene) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip} >
                <GeneDetail gene={gene} />
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    render() {
        return <AnnotationTrack
            {...this.props}
            rowHeight={ROW_HEIGHT}
            intervalArranger={INTERVAL_ARRANGER}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export default withTooltip(GeneAnnotationTrack);
