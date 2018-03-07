import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import { Gene } from '../../../model/Gene';

export const ANNOTATION_HEIGHT = 9;
export const UTR_HEIGHT = 5;
export const LABEL_SIZE = ANNOTATION_HEIGHT * 1.5;

const ARROW_WIDTH = 5;
const ARROW_SEPARATION = 12;
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
     * 
     * @param {number} startAbsBase 
     * @param {number} endAbsBase 
     * @param {number} height 
     * @param {string} color 
     */
    _drawCenteredBox(startAbsBase, endAbsBase, height, color) {
        const {drawModel, svgJs} = this.props;
        const startX = drawModel.baseToX(startAbsBase);
        const width = drawModel.basesToXWidth(endAbsBase - startAbsBase);
        const box = svgJs.rect(width, height).attr({
            x: startX,
            y: (ANNOTATION_HEIGHT - height) / 2,
            fill: color
        });
        return box;
    }

    /**
     * Draws arrows in an interval in the most aesthetically pleasing way possible.
     * 
     * @param {number} startX 
     * @param {number} endX 
     * @param {string} color 
     */
    _drawArrowsInInterval(startX, endX, color, clip) {
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
            const arrowTailX = gene.getIsForwardStrand() ? arrowTipX - ARROW_WIDTH : arrowTipX + ARROW_WIDTH;
            const arrowPoints = [
                [arrowTailX, 1],
                [arrowTipX, centerY],
                [arrowTailX, bottomY - 1]
            ];

            const arrow = svgJs.polyline(arrowPoints).attr({
                fill: "none",
                stroke: color,
                "stroke-width": 1
            });
            if (clip) {
                arrow.clipWith(clip);
            }
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

        // Clip: a set of locations where an element will show up; it will not show elsewhere
        let drawOnlyInExons = svgJs.clip();
        // Translated exons, as thick boxes
        for (let exon of gene.absTranslated) {
            const exonBox = this._drawCenteredBox(...exon, ANNOTATION_HEIGHT, COLOR);
            drawOnlyInExons.add(exonBox.clone()); // See comment for declaration of arrowClip
        }

        // Arrows
        this._drawArrowsInInterval(startX, endX, COLOR); // Arrows on the center line
        this._drawArrowsInInterval(startX, endX, BACKGROUND_COLOR, drawOnlyInExons); // Arrows within exons

        // UTRs, as thin boxes
        for (let utr of gene.absUtrs) {
            this._drawCenteredBox(...utr, ANNOTATION_HEIGHT, BACKGROUND_COLOR); // White box to cover up arrows
            this._drawCenteredBox(...utr, UTR_HEIGHT, COLOR); // The actual box that represents the UTR
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
