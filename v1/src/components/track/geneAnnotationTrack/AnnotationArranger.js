import React from 'react';
import PropTypes from 'prop-types';

import { ANNOTATION_HEIGHT, GeneAnnotation } from './GeneAnnotation';
import SvgJsManaged from '../../SvgJsManaged';

import Gene from '../../../model/Gene';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import OpenInterval from '../../../model/interval/OpenInterval';

const DEFAULT_MAX_ROWS = 7;
const ROW_BOTTOM_PADDING = 5;
const ANNOTATION_RIGHT_PADDING = 30;

/**
 * Arranges gene annotations on a SVG.
 * 
 * @author Silas Hsu
 */
class AnnotationArranger extends React.PureComponent {
    static HEIGHT_PER_ROW = ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING;

    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.instanceOf(Gene)), // Array of Gene objects
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Draw model to use
        viewWindow: PropTypes.instanceOf(OpenInterval), // X range of initially visible pixels
        options: PropTypes.shape({
            rows: PropTypes.number,
            color: PropTypes.string,
            backgroundColor: PropTypes.string,
        }),

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
        options: {},
    };

    /**
     * Sorts genes by start position in the genome, from lowest to highest.
     * If same start position, plot longer gene first
     * @param {Gene[]} genes - array of Gene to sort
     * @return {Gene[]} sorted genes
     */
    _sortGenes(genes) {
        return genes.sort((gene1, gene2) => {
            const absStartComparison = gene1.absStart - gene2.absStart;
            if (absStartComparison === 0) {
                return gene2.getLength() - gene1.getLength();
            } else {
                return absStartComparison;
            }
        });
    }

    /**
     * Arranges GeneAnnotation components so they don't overlap.
     * 
     * @override
     */
    render() {
        const {data, drawModel, viewWindow, options} = this.props;
        const rows = options.rows || DEFAULT_MAX_ROWS;
        if (rows <= 0) {
            return null;
        }

        let children = [];
        // Last row is reserved for anything that doesn't fit, so we don't track the Xs for that row.
        let maxXsForRows = new Array(rows - 1).fill(-Infinity); 
        const genes = this._sortGenes(data);
        for (let gene of genes) {
            let geneWidth = drawModel.basesToXWidth(gene.absEnd - gene.absStart);
            if (geneWidth < 1) { // No use rendering something less than one pixel wide.
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
            let isMinimal;
            if (row === -1) { // It won't fit!  Put it in the last row, unlabeled
                isMinimal = true;
                row = rows - 1;
            } else {
                isMinimal = false;
                maxXsForRows[row] = endX + ANNOTATION_RIGHT_PADDING + labelWidth + 2;
            }
            const y = row * (ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING);

            children.push(
            <SvgJsManaged
                key={gene.refGeneRecord._id}
                transform={`translate(0 ${y})`}
                onClick={event => this.props.onGeneClick(event, gene)}
            >
                <GeneAnnotation
                    gene={gene}
                    isMinimal={isMinimal}
                    drawModel={drawModel}
                    viewWindow={viewWindow}
                    options={options}
                />
            </SvgJsManaged>
            );
        }
        return children;
    }
}

export default AnnotationArranger;