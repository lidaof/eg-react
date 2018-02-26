import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import GeneDetail from './GeneDetail';

export const ANNOTATION_HEIGHT = 9;
export const UTR_HEIGHT = 5;
export const LABEL_SIZE = ANNOTATION_HEIGHT * 1.5;

const ARROW_WIDTH = 6;
const ARROW_SEPARATION = 10;
const COLOR = "blue";
const IN_EXON_ARROW_COLOR = "white";

const LABEL_BACKGROUND_PADDING = 2;

/*
const viewRegion = new DisplayedRegionModel(new NavigationContext([myGene]));

class StandaloneGeneAnnotation {
    static propTypes = {
        gene: Gene,
        width: number,
        viewRegion: 
    }
    render() {
        const drawModel = new DisplayedRegionModel(new NavigationContext([gene]));
        return <svg>
        <SvgJsManaged><GeneAnnotation gene={gene} isLabeled={true} drawModel={drawModel} leftBoundary={-Infinity} /></SvgJsManaged>
        </svg>
    }
}
*/

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
        const {svgJs, gene, isLabeled, drawModel, leftBoundary, rightBoundary} = this.props;
        svgJs.clear();

        const details = gene._details;
        const startX = drawModel.baseToX(gene.absStart);
        const endX = drawModel.baseToX(gene.absEnd);
        const centerY = ANNOTATION_HEIGHT / 2;
        const bottomY = ANNOTATION_HEIGHT;
        //console.log(`${gene.getName()}: ${startX} - ${endX}`);

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

        let skipArrow = []; // regions skip drawing arrow - utrs
        let whiteArrow = []; // regions draw white arrow - exons
        // UTRs
        for (let utr of details.absUtrs) {
            let utrBox = svgJs.rect(drawModel.basesToXWidth(utr.end - utr.start), UTR_HEIGHT);
            utrBox.attr({
                x: drawModel.baseToX(utr.start),
                y: 2,
                fill: COLOR
            });
            skipArrow.push([drawModel.baseToX(utr.start), drawModel.baseToX(utr.end)]);
        }

        // Exons
        // someComponent.clipWith(exonClip) will make it show up only where the exons are.
        //let exonClip = svgJs.clip();
        for (let exon of details.absExons) {
            let exonBox = svgJs.rect(drawModel.basesToXWidth(exon.end - exon.start), ANNOTATION_HEIGHT);
            exonBox.attr({
                x: drawModel.baseToX(exon.start),
                y: 0,
                fill: COLOR
            });
            whiteArrow.push([drawModel.baseToX(exon.start), drawModel.baseToX(exon.end)]);
            //exonClip.add(exonBox.clone());
        }
        //arrows should not draw outside of gene range
        const arrowStartX = gene.strand === "+" ? startX + ARROW_WIDTH : startX;
        const arrowEndX = gene.strand === "+" ? endX : endX - ARROW_WIDTH;
        // Arrows
        for (let x = arrowStartX; x <= arrowEndX; x += ARROW_SEPARATION) {
            let stokeColor = COLOR, inUTR = false, inExon=false;
            for (const region of skipArrow){
                if (x >= region[0] && x <= region[1]){
                    inUTR = true;
                    break;
                }
            }
            for (const region of whiteArrow){
                if(x >= region[0] && x <= region[1]){
                    inExon = true;
                    break;
                }
            }
            if (inUTR) { continue; }
            if (inExon){ stokeColor = IN_EXON_ARROW_COLOR; }
            let arrowTipX = gene.strand === "+" ?
                x - ARROW_WIDTH : // Point to the right
                x + ARROW_WIDTH; // Point to the left
            let arrowPoints = [
                [arrowTipX, 0+1],
                [x, centerY],
                [arrowTipX, bottomY-1]
            ]

            // Each arrow is duplicated, but the second set will only draw inside exons.
            svgJs.polyline(arrowPoints).attr({
                fill: "none",
                stroke: stokeColor,
                "stroke-width": 1
            });
            // svgJs.polyline(arrowPoints).attr({
            //     fill: "none",
            //     stroke: IN_EXON_ARROW_COLOR,
            //     "stroke-width": 1
            // }).clipWith(exonClip); // <-- Note the .clipWith()
        }

        // Label
        let labelX, textAnchor;
        console.log(leftBoundary);
        console.log(rightBoundary);
        // Label width is approx. because calculating bounding boxes is expensive.
        let estimatedLabelWidth = gene.getName().length * ANNOTATION_HEIGHT;
        if (startX - estimatedLabelWidth < leftBoundary && leftBoundary < endX ) {
            if (endX + estimatedLabelWidth + 2 < rightBoundary){
                labelX = endX + estimatedLabelWidth + 2;
                textAnchor = "end";
            } else {
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
            }           
        } else {
            //labelX = (gene.strand === "+" ? startX - ARROW_WIDTH : startX) - 5;
            labelX = startX - 1;
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
