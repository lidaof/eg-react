import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import GeneAnnotation from './GeneAnnotation';
import GeneDetail from './GeneDetail';
import NewTrack from '../NewTrack';

import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import withTooltip from '../commonComponents/withTooltip';
import Tooltip from '../commonComponents/Tooltip';
import configOptionMerging from '../commonComponents/configOptionMerging';
import { configStaticDataSource } from '../commonComponents/configDataFetch';
import configDataProcessing from '../commonComponents/configDataProcessing';

import NumberConfig from '../contextMenu/NumberConfig';
import { PrimaryColorConfig, BackgroundColorConfig } from '../contextMenu/ColorConfig';

import GeneSource from '../../../dataSources/GeneSource';
import DataProcessor from '../../../dataSources/DataProcessor';

import Gene from '../../../model/Gene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';

const ROW_VERTICAL_PADDING = 5;
const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 10
};

class GeneProcessor extends DataProcessor {
    process(props) {
        if (!props.data) {
            return [];
        };

        return props.data.map(record => new Gene(record));
    }
}

class GeneAnnotationTrack extends React.Component {
    static propTypes = Object.assign({},
        NewTrack.trackContainerProps,
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
     * @param {number} y - y coordinate to render the annotation
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @param {DisplayedRegionModel} - region in which to draw
     * @param {number} - width of the drawing area
     * @param {Object} - x range of visible pixels
     * @return {JSX.Element} element visualizing the gene
     */
    renderAnnotation(gene, absInterval, y, isLastRow, viewRegion, width, viewWindow) {
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
            options={this.props.options}
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

const withOptionMerging = configOptionMerging(DEFAULT_OPTIONS);
const withDataFetch = configStaticDataSource(props => new GeneSource(props.trackModel.genome));
const withDataProcessing = configDataProcessing(new GeneProcessor());
const configure = _.flowRight([withOptionMerging, withDataFetch, withDataProcessing, withTooltip]);
const ConfiguredAnnotationTrack = configure(GeneAnnotationTrack);

function NumRowsConfig(props) {
    return <NumberConfig {...props} optionPropName="rows" label="Rows to draw: " minValue={1} />
}

const GeneAnnotationConfig = {
    component: ConfiguredAnnotationTrack,
    menuItems: [NumRowsConfig, PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
};

export default GeneAnnotationConfig;
