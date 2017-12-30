import React from 'react';
import PropTypes from 'prop-types';

import { ANNOTATION_HEIGHT, GeneAnnotation } from './GeneAnnotation';
import SvgComponent from '../SvgComponent';

import Gene from '../../model/Gene';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

const DEFAULT_MAX_ROWS = 7;
const ROW_BOTTOM_PADDING = 5;
const ANNOTATION_RIGHT_PADDING = 30;

/**
 * Arranges gene annotations on a SVG.
 * 
 * @author Silas Hsu
 */
class AnnotationArranger extends SvgComponent {
    static propTypes = {
        /**
         * Used to calculate absolute coordinates of genes
         */
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        data: PropTypes.arrayOf(PropTypes.instanceOf(Gene)), // Array of Gene objects
        leftBoundary: PropTypes.number, // The x coordinate of the left boundary of the SVG, in SVG's coordinate system
        maxRows: PropTypes.number, // Max rows of annotations to draw before putting them unlabeled at the bottom

        /**
         * Called when a gene is clicked.  Has the signature
         *     (event: React.SyntheticEvent, gene: Gene): void
         *         `event`: the mouse event from the click
         *         `gene`: the Gene object that was clicked
         */
        onGeneClick: PropTypes.func
    };

    static defaultProps = {
        data: [],
        leftBoundary: 0,
        maxRows: DEFAULT_MAX_ROWS,
    };

    /**
     * Shallowly compares `this.props` and `nextProps`.  Returns true if there is any difference, otherwise false.
     * 
     * @param {any} nextProps - next props that the component will receive
     * @return {boolean} whether the component should update
     * @override
     */
    shouldComponentUpdate(nextProps) {
        return this.props.data !== nextProps.data || this.props.xOffset !== nextProps.xOffset;
    }

    /**
     * Sorts genes by start position in the genome, from lowest to highest.
     * 
     * @param {Gene[]} genes - array of Gene to sort
     * @return {Gene[]} sorted genes
     */
    _sortGenes(genes) {
        return genes.sort((gene1, gene2) => gene1.absStart - gene2.absStart);
    }

    /**
     * Arranges GeneAnnotation components so they don't overlap.
     * 
     * @override
     */
    render() {
        let children = [];
        let rowXExtents = new Array(this.props.maxRows).fill(-Number.MAX_VALUE);
        let genes = this._sortGenes(this.props.data);
        let numHiddenGenes = 0;
        for (let gene of genes) {
            let geneWidth = this.props.drawModel.basesToXWidth(gene.absEnd - gene.absStart);
            if (geneWidth < 1) { // No use rendering something less than one pixel wide.
                numHiddenGenes++;
                continue;
            }
            
            // Label width is approx. because calculating bounding boxes is expensive.
            let estimatedLabelWidth = gene.getName().length * ANNOTATION_HEIGHT;
            let startX = this.props.drawModel.baseToX(gene.absStart) - estimatedLabelWidth;
            let endX = this.props.drawModel.baseToX(gene.absEnd);
            if (startX < estimatedLabelWidth) {
                endX = Math.max(endX, endX + estimatedLabelWidth);
            }
            let row = rowXExtents.findIndex(rightmostX => startX > rightmostX);
            let isLabeled;
            if (row === -1) {
                isLabeled = false;
                row = this.props.maxRows;
                numHiddenGenes++;
            } else {
                isLabeled = true;
                rowXExtents[row] = endX + ANNOTATION_RIGHT_PADDING;
            }
            
            children.push(<GeneAnnotation
                viewRegion={this.props.viewRegion}
                drawModel={this.props.drawModel}
                leftBoundary={this.props.leftBoundary}
                svgNode={this.group}
                gene={gene}
                isLabeled={isLabeled}
                topY={row * (ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING)}
                onClick={this.props.onGeneClick}
                key={gene.getDetails().id}
            />);
        }
        console.log(`${numHiddenGenes} genes hidden this render`);
        return <div>{children}</div>;
    }
}

export default AnnotationArranger;
