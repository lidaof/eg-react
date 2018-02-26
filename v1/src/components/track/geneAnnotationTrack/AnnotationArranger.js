import React from 'react';
import PropTypes from 'prop-types';

import { ANNOTATION_HEIGHT, GeneAnnotation } from './GeneAnnotation';
import SvgJsManaged from '../../SvgJsManaged';

import Gene from '../../../model/refGene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';

const DEFAULT_MAX_ROWS = 7;
const ROW_BOTTOM_PADDING = 5;
const ANNOTATION_RIGHT_PADDING = 30;

/**
 * Arranges gene annotations on a SVG.
 * 
 * @author Silas Hsu
 */
class AnnotationArranger extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.instanceOf(Gene)), // Array of Gene objects
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Draw model to use
        leftBoundary: PropTypes.number,
        rightBoundary: PropTypes.number,
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
     * Shallowly compares the `data` prop.
     * 
     * @param {any} nextProps - next props that the component will receive
     * @return {boolean} whether the component should update
     * @override
     */
    shouldComponentUpdate(nextProps) {
        return this.props.data !== nextProps.data;
    }

    /**
     * Sorts genes by start position in the genome, from lowest to highest.
     * If same start position, plot longer gene first
     * @param {Gene[]} genes - array of Gene to sort
     * @return {Gene[]} sorted genes
     */
    _sortGenes(genes) {
        //return genes.sort((gene1, gene2) => gene1.absStart - gene2.absStart);
        //return genes.sort((gene1, gene2) => gene2.length - gene1.length);
        return genes.sort((gene1, gene2) => {
            const absStartComparison = gene1.absStart - gene2.absStart;
            if (absStartComparison === 0) {
                return gene2.length - gene1.length;
            } else {
                return absStartComparison;
            }
        })
    }

    /**
     * Arranges GeneAnnotation components so they don't overlap.
     * 
     * @override
     */
    render() {
        const {data, drawModel, leftBoundary, rightBoundary, maxRows} = this.props;
        let children = [];
        let maxXsForRows = new Array(maxRows).fill(-Infinity);
        const genes = this._sortGenes(data);
        let numHiddenGenes = 0;
        for (let gene of genes) {
            let geneWidth = drawModel.basesToXWidth(gene.absEnd - gene.absStart);
            if (geneWidth < 1) { // No use rendering something less than one pixel wide.
                numHiddenGenes++;
                continue;
            }
            
            /*
             * Label width is approximate because calculating bounding boxes is expensive.
             * This also means startX and endX are approximate since label width is approximate.
             */
            const labelWidth = gene.getName().length * ANNOTATION_HEIGHT;
            // Text appears to the left of the annotation, so subtract the estimated label width
            const startX = drawModel.baseToX(gene.absStart) - labelWidth;
            // Labels could also be pushed to the right if they go off the screen.
            const endX = Math.max(drawModel.baseToX(gene.absStart) + labelWidth, drawModel.baseToX(gene.absEnd));
            // Find the first row where the annotation won't overlap with others in the row
            let row = maxXsForRows.findIndex(maxX => maxX < startX); 
            let isLabeled;
            if (row === -1) { // It won't fit!  Put it in the last row, unlabeled
                isLabeled = false;
                row = this.props.maxRows;
                numHiddenGenes++;
            } else {
                isLabeled = true;
                maxXsForRows[row] = endX + ANNOTATION_RIGHT_PADDING + labelWidth + 2;
            }
            const y = row * (ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING);

            children.push(
            <SvgJsManaged
                key={gene.id}
                transform={`translate(0 ${y})`}
                onClick={event => this.props.onGeneClick(event, gene)}
            >
                <GeneAnnotation
                    gene={gene}
                    isLabeled={isLabeled}
                    drawModel={drawModel}
                    leftBoundary={leftBoundary}
                    rightBoundary={rightBoundary}
                />
            </SvgJsManaged>
            );
        }
        console.log(`${numHiddenGenes} genes hidden this render`);
        return children;
    }
}

export default AnnotationArranger;
