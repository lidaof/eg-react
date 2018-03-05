import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import { Gene } from '../../../model/Gene';

export const ANNOTATION_HEIGHT = 9;
export const UTR_HEIGHT = 5;
export const LABEL_SIZE = ANNOTATION_HEIGHT * 1.5;

const ARROW_WIDTH = 5;
const ARROW_SEPARATION = 10;
const COLOR = "blue";
const BACKGROUND_COLOR = "white";

const LABEL_BACKGROUND_PADDING = 2;

/**
 * A single annotation for the gene annotation track.
 * 
 * @author Silas Hsu and Daofeng Li
 */
export class GeneAnnotation extends React.PureComponent {
    static propTypes = {
        /**
         * SVG drawing API.  Required but not marked as such to prevent warnings.
         */
        svgJs: PropTypes.instanceOf(SVG.Element),
        gene: PropTypes.instanceOf(Gene).isRequired, // Gene structure to draw
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Drawing model
        isMinimal: PropTypes.bool, // If true, display only a minimal box
        leftBoundary: PropTypes.number, // The x coordinate of the left boundary of the initial view window
        rightBoundary: PropTypes.number // The x coordinate of the right boundary of the initial view window
    };

    static defaultProps = {
        leftBoundary: -Infinity,
        rightBoundary: Infinity
    };

    /**
     * Draws arrows in an interval in the most aesthetically pleasing way possible.
     * 
     * @param {number} startX 
     * @param {number} endX 
     * @param {string} color 
     */
    _drawArrowsInInterval(startX, endX, color) {
        const {gene, svgJs} = this.props;
        const centerY = ANNOTATION_HEIGHT / 2;
        const bottomY = ANNOTATION_HEIGHT;

        let placementStartX = startX;
        let placementEndX = endX;
        if (gene.getIsForwardStrand()) { // Point to the right
            placementStartX += ARROW_WIDTH;
        } else {
            placementEndX -= ARROW_WIDTH;
        }

        // Naming: if our arrows look like '<', then the tip is on the left, and the two tails are on the right.
        for (let arrowTipX = placementStartX; arrowTipX <= placementEndX; arrowTipX += ARROW_SEPARATION) {
            // Is forward strand ? point to the right : point to the left 
            let arrowTailX = gene.getIsForwardStrand() ? arrowTipX - ARROW_WIDTH : arrowTipX + ARROW_WIDTH;
            let arrowPoints = [
                [arrowTailX, 1],
                [arrowTipX, centerY],
                [arrowTailX, bottomY - 1]
            ];

            svgJs.polyline(arrowPoints).attr({
                fill: "none",
                stroke: color,
                "stroke-width": 1
            });
        }
    }

    /**
     * Draws the annotation.
     * 
     * @override
     */
    render() {
        const {svgJs, gene, isMinimal, drawModel, leftBoundary, rightBoundary} = this.props;
        svgJs.clear();

        const startX = drawModel.baseToX(gene.absStart);
        const endX = drawModel.baseToX(gene.absEnd);
        const centerY = ANNOTATION_HEIGHT / 2;

        // Box that covers the whole annotation to increase the click area
        let coveringBox = svgJs.rect(endX - startX, ANNOTATION_HEIGHT).attr({
            x: startX,
            y: 0,
        });

        if (isMinimal) { // Just fill the box and end there
            coveringBox.fill(COLOR);
            return null;
        } else {
            coveringBox.opacity(0);
        }

        // Center line
        svgJs.line(startX, centerY, endX, centerY).stroke({
            color: COLOR,
            width: 2
        });

        // Arrows on that center line
        // TODO arrows may overlap with exon boxes, which doesn't look that good.  If that is annoying, we will have to
        // calculate non-exon intervals.
        this._drawArrowsInInterval(startX, endX, COLOR);

        // UTRs, as thin boxes
        for (let utr of gene.absUtrs) {
            const utrWidth = drawModel.basesToXWidth(utr.end - utr.start);
            const utrStart = drawModel.baseToX(utr.start);

            svgJs.rect(utrWidth, ANNOTATION_HEIGHT).attr({ // Box, same color as background, to cover up arrows
                x: utrStart,
                y: 0,
                fill: BACKGROUND_COLOR
            });
            svgJs.rect(utrWidth, UTR_HEIGHT).attr({ // The actual colored box to represent the UTR
                x: utrStart,
                y: UTR_HEIGHT / 2,
                fill: COLOR
            });
        }

        // Translated exons, as thick boxes
        for (let exon of gene.absTranslated) {
            svgJs.rect(drawModel.basesToXWidth(exon.end - exon.start), ANNOTATION_HEIGHT).attr({
                x: drawModel.baseToX(exon.start),
                y: 0,
                fill: COLOR
            });
            // Draw arrows of the background color inside the box
            this._drawArrowsInInterval(drawModel.baseToX(exon.start), drawModel.baseToX(exon.end), BACKGROUND_COLOR);
        }

        // Label
        let labelX, textAnchor;
        // Label width is approx. because calculating bounding boxes is expensive.
        const estimatedLabelWidth = gene.getName().length * ANNOTATION_HEIGHT;
        const isBlockedLeft = startX - estimatedLabelWidth < leftBoundary; // Label obscured if put on the left
        const isBlockedRight = endX + estimatedLabelWidth > rightBoundary; // Label obscured if put on the right
        if (!isBlockedLeft) { // Yay, we can put it on the left!
            labelX = startX - 1;
            textAnchor = "end";
        } else if (!isBlockedRight) { // Yay, we can put it on the right!
            labelX = endX + 1;
            textAnchor = "start";
        } else { // Just put it directly on top of the annotation
            labelX = leftBoundary + 1;
            textAnchor = "start";
            // We have to add some highlighting for contrast purposes.
            svgJs.rect(estimatedLabelWidth + LABEL_BACKGROUND_PADDING * 2, ANNOTATION_HEIGHT).attr({
                x: leftBoundary - LABEL_BACKGROUND_PADDING,
                y: 0,
                fill: BACKGROUND_COLOR,
                opacity: 0.65,
            });
        }

        svgJs.text(gene.getName()).attr({
            x: labelX,
            y: -ANNOTATION_HEIGHT,
            "text-anchor": textAnchor,
            "font-size": LABEL_SIZE,
        });

        return null;
    }
}

export default GeneAnnotation;
