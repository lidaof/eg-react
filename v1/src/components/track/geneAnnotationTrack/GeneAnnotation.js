import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';
import LinearDrawingModel from '../../../model/LinearDrawingModel';

export const ANNOTATION_HEIGHT = 8;
export const UTR_HEIGHT = 6;
export const LABEL_SIZE = ANNOTATION_HEIGHT * 1.5;

const ARROW_WIDTH = 5;
const ARROW_SEPARATION = 10;
const COLOR = "blue";
const IN_EXON_ARROW_COLOR = "white";

const LABEL_BACKGROUND_PADDING = 2;

/**
 * A single annotation for the gene annotation track.
 * 
 * @author Silas Hsu and Daofeng Li
 */
export class GeneAnnotation extends React.Component {
    static propTypes = {
        svgJs: PropTypes.instanceOf(SVG.Element),
        gene: PropTypes.object.isRequired, // Gene to display
        isLabeled: PropTypes.bool.isRequired, // Whether to display the gene's name
        drawModel: PropTypes.instanceOf(LinearDrawingModel),
        leftBoundary: PropTypes.number.isRequired, // The x coordinate of the SVG's left boundary
    };

    /**
     * Draws the annotation.
     * 
     * @override
     */
    render() {
        const {svgJs, gene, isLabeled, drawModel, leftBoundary} = this.props;
        svgJs.clear();

        const details = gene.getDetails();
        const startX = drawModel.baseToX(gene.absStart);
        const endX = drawModel.baseToX(gene.absEnd);
        const centerY = ANNOTATION_HEIGHT / 2;
        const bottomY = ANNOTATION_HEIGHT;

        // Box that covers the whole annotation to increase the click area
        let coveringBox = svgJs.rect(endX - startX, ANNOTATION_HEIGHT).attr({
            x: startX,
            y: 0,
        });
        if (!isLabeled) { // Unlabeled: just fill the box and end there
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

        // UTRs
        // someComponent.clipWith(exonClip) will make it show up only where the exons are.
        for (let utr of details.absUtrs) {
            let utrBox = svgJs.rect(drawModel.basesToXWidth(utr.end - utr.start), UTR_HEIGHT);
            utrBox.attr({
                x: drawModel.baseToX(utr.start),
                y: 0,
                fill: COLOR
            });
        }

        // Exons
        // someComponent.clipWith(exonClip) will make it show up only where the exons are.
        let exonClip = svgJs.clip();
        for (let exon of details.absExons) {
            let exonBox = svgJs.rect(drawModel.basesToXWidth(exon.end - exon.start), ANNOTATION_HEIGHT);
            exonBox.attr({
                x: drawModel.baseToX(exon.start),
                y: 0,
                fill: COLOR
            });
            exonClip.add(exonBox.clone());
        }

        // Arrows
        for (let x = startX; x <= endX; x += ARROW_SEPARATION) {
            let arrowTipX = details.strand === "+" ?
                x - ARROW_WIDTH : // Point to the right
                x + ARROW_WIDTH; // Point to the left
            let arrowPoints = [
                [arrowTipX, 0],
                [x, centerY],
                [arrowTipX, bottomY]
            ]

            // Each arrow is duplicated, but the second set will only draw inside exons.
            svgJs.polyline(arrowPoints).attr({
                fill: "none",
                stroke: COLOR,
                "stroke-width": 1
            });
            svgJs.polyline(arrowPoints).attr({
                fill: "none",
                stroke: IN_EXON_ARROW_COLOR,
                "stroke-width": 1
            }).clipWith(exonClip); // <-- Note the .clipWith()
        }

        // Label
        let labelX, textAnchor;
        // Label width is approx. because calculating bounding boxes is expensive.
        let estimatedLabelWidth = gene.getName().length * ANNOTATION_HEIGHT;
        if (startX - estimatedLabelWidth < leftBoundary && leftBoundary < endX ) {
            // It's going to go off the screen; we need to move the label
            labelX = leftBoundary;
            textAnchor = "start";
            // Add highlighting, as the label will overlap the other stuff
            svgJs.rect(estimatedLabelWidth + LABEL_BACKGROUND_PADDING * 2, ANNOTATION_HEIGHT).attr({
                x: leftBoundary - LABEL_BACKGROUND_PADDING,
                y: 0,
                fill: "white",
                opacity: 0.65,
            });
        } else {
            labelX = (details.strand === "+" ? startX - ARROW_WIDTH : startX) - 5;
            textAnchor = "end";
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
