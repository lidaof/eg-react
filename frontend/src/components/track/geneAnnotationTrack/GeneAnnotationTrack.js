import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import GeneAnnotation from './GeneAnnotation';
import GeneDetail from './GeneDetail';

import Track from '../commonComponents/Track';
import AnnotationTrack, { SUGGESTED_MENU_ITEMS } from '../commonComponents/annotation/AnnotationTrack';
import withTooltip from '../commonComponents/tooltip/withTooltip';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import configOptionMerging from '../commonComponents/configOptionMerging';
import { configStaticDataSource } from '../commonComponents/configDataFetch';

import GeneSource from '../../../dataSources/GeneSource';
import Gene from '../../../model/Gene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';

const ROW_VERTICAL_PADDING = 5;
const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 10
};

/**
 * Converts gene data objects from the server to Gene objects.
 * 
 * @param {Object[]} data - raw data from server
 * @return {Gene[]} genes made from raw data
 */
function formatDatabaseRecords(data) {
    return data.map(record => new Gene(record));
}

const withOptionMerging = configOptionMerging(DEFAULT_OPTIONS);
const withDataFetch = configStaticDataSource(props => new GeneSource(props.trackModel.genome), formatDatabaseRecords);
const configure = _.flowRight([withOptionMerging, withDataFetch, withTooltip]);

/**
 * Track that displays gene annotations.
 * 
 * @author Silas Hsu
 */
class GeneAnnotationTrack extends React.Component {
    static propTypes = Object.assign({},
        Track.trackContainerProps,
        configOptionMerging.INJECTED_PROPS,
        configStaticDataSource.INJECTED_PROPS,
        withTooltip.INJECTED_PROPS,
        {
        /**
         * Genes to render.  GeneProcessor provides this.
         */
        data: PropTypes.arrayOf(PropTypes.instanceOf(Gene)).isRequired,
        }
    );

    static defaultProps = {
        options: {},
        onShowTooltip: tooltip => undefined,
        onHideTooltip: () => undefined,
    };

    constructor(props) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    /**
     * Gets the horizontal (left and right) padding required by each gene.  Does this by estimating label width.
     * 
     * @param {Gene} gene - gene to display
     * @return {number} requested horizontal padding
     */
    getHorizontalPadding(gene) {
        return gene.getName().length * GeneAnnotation.HEIGHT;
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
            y={y}
            isMinimal={isLastRow}
            drawModel={drawModel}
            viewWindow={viewWindow}
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
            rowHeight={GeneAnnotation.HEIGHT + ROW_VERTICAL_PADDING}
            getHorizontalPadding={this.getHorizontalPadding}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

const GeneAnnotationConfig = {
    component: configure(GeneAnnotationTrack),
    menuItems: SUGGESTED_MENU_ITEMS,
    defaultOptions: DEFAULT_OPTIONS,
};

export default GeneAnnotationConfig;
