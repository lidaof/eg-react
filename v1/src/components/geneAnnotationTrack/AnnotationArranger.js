import { ANNOTATION_HEIGHT, LABEL_SIZE, GeneAnnotation } from './GeneAnnotation';
import PropTypes from 'prop-types';
import React from 'react';
import SvgComponent from '../SvgComponent';

const DEFAULT_MAX_ROWS = 6;
const ROW_BOTTOM_PADDING = 5;
const ANNOTATION_RIGHT_PADDING = 30;

/**
 * Arranges gene annotations on a SVG.
 * 
 * @author Silas Hsu
 */
class AnnotationArranger extends SvgComponent {
    /**
     * Shallowly compares `this.props` and `nextProps`.  Returns true if there is any difference, otherwise false.
     * 
     * @param {any} nextProps - next props that the component will receive
     * @return {boolean} whether the component should update
     * @override
     */
    shouldComponentUpdate(nextProps) {
        for (let key in nextProps) {
            if (this.props[key] !== nextProps[key]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Filters an array of Gene such that only genes visible in the current view are present, and then sorts them by
     * start position in the genome.
     * 
     * @param {Gene[]} genes - array of Gene to sort and filter
     * @return {Gene[]} subset of the input array
     */
    _filterAndSortGenes(genes) {
        let visibleGenes = genes.filter(gene => gene.isInView);
        return visibleGenes.sort((gene1, gene2) => gene1.absStart - gene2.absStart);
    }

    /**
     * Adds a label to the SVG expressing how many genes are unlabeled
     * 
     * @param {number} numHiddenGenes - number of unlabeled/hidden genes
     */
    _addHiddenGenesReminder(numHiddenGenes) {
        if (numHiddenGenes > 0) {
            let maxRows = this.props.maxRows || DEFAULT_MAX_ROWS;
            let genesHiddenText = numHiddenGenes === 1 ? "1 gene unlabeled" : `${numHiddenGenes} genes unlabeled`;
            this.group.text(genesHiddenText).attr({
                x: 10,
                y: (maxRows) * (ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING) + 5,
                "font-size": LABEL_SIZE,
                "font-style": "italic"
            });
        }
    }

    /**
     * Arranges GeneAnnotation components so they don't overlap.
     * 
     * @override
     */
    render() {
        this.group.clear();

        let children = [];
        let rowXExtents = new Array(this.props.maxRows).fill(-Number.MAX_VALUE);
        let genes = this._filterAndSortGenes(this.props.data);
        let numHiddenGenes = 0;
        for (let gene of genes) {
            let geneWidth = this.props.drawModel.basesToXWidth(gene.absEnd - gene.absStart);
            if (geneWidth < 1) { // No use rendering something less than one pixel wide.
                numHiddenGenes++;
                continue;
            }

            // Label width is approx. because calculating bounding boxes is expensive.
            let estimatedLabelWidth = gene.name.length * ANNOTATION_HEIGHT;
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
                drawModel={this.props.drawModel}
                svgNode={this.props.svgNode}
                xOffset={this.props.xOffset}
                yOffset={this.props.yOffset}
                gene={gene}
                isLabeled={isLabeled}
                topY={row * (ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING)}
                onClick={this.props.onGeneClick}
                key={gene.id}
            />);
        }
        this._addHiddenGenesReminder(numHiddenGenes);

        return <div>{children}</div>;
    }
}

AnnotationArranger.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    maxRows: PropTypes.number,
    onGeneClick: PropTypes.func
};

AnnotationArranger.defaultProps = {
    maxRows: DEFAULT_MAX_ROWS,
};

export default AnnotationArranger;
