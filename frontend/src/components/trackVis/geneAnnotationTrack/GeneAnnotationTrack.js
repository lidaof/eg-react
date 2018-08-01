import React from 'react';
import PropTypes from 'prop-types';

import { GeneAnnotation, DEFAULT_OPTIONS } from './GeneAnnotation';
import GeneDetail from './GeneDetail';

import Track from '../commonComponents/Track';
import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';
import withTooltip from '../commonComponents/tooltip/withTooltip';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import configOptionMerging from '../commonComponents/configOptionMerging';

import { GeneAnnotationScaffold } from './GeneAnnotationScaffold';

const ROW_VERTICAL_PADDING = 5;
const ROW_HEIGHT = GeneAnnotation.HEIGHT + ROW_VERTICAL_PADDING;
const getGenePadding = gene => gene.getName().length * GeneAnnotation.HEIGHT;

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * Track that displays gene annotations.
 *
 * @author Silas Hsu
 */
class GeneAnnotationTrack extends React.Component {
    static propTypes = Object.assign({}, Track.trackContainerProps, withTooltip.INJECTED_PROPS, {
        // Genes to render
        data: PropTypes.array.isRequired //PropTypes.arrayOf(PropTypes.instanceOf(Gene)).isRequired,
    });

    static defaultProps = {
        options: {},
        onShowTooltip: element => undefined,
        onHideTooltip: () => undefined
    };

    constructor(props) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    /**
     * Renders one gene annotation.
     * 
     * @param {PlacedFeatureGroup} placedGroup - gene and draw coordinates
     * @param {number} y - y coordinate of the top of the annotation
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @return {JSX.Element} element visualizing the gene
     */
    renderAnnotation(placedGroup, y, isLastRow) {
        const gene = placedGroup.feature;
        const {viewWindow, options} = this.props;
        return <GeneAnnotationScaffold
            key={gene.id}
            gene={gene}
            xSpan={placedGroup.xSpan}
            viewWindow={viewWindow}
            y={y}
            isMinimal={isLastRow}
            options={options}
            onClick={this.renderTooltip}
        >
            {
            placedGroup.placedFeatures.map((placedGene, i) => 
                <GeneAnnotation
                    key={i}
                    placedGene={placedGene}
                    y={y}
                    options={options}
                />
            )
            }
        </GeneAnnotationScaffold>;
    }

    /**
     * Renders the tooltip for a gene.
     *
     * @param {MouseEvent} event - mouse event that triggered the tooltip request
     * @param {Gene} gene - gene for which to display details
     */
    renderTooltip(event, gene) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip}>
                <GeneDetail gene={gene} collectionName={this.props.trackModel.name} />
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    render() {
        return <AnnotationTrack
            {...this.props}
            rowHeight={ROW_HEIGHT}
            featurePadding={getGenePadding}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export default withDefaultOptions(withTooltip(GeneAnnotationTrack));
