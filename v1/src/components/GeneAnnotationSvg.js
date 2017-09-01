import PropTypes from 'prop-types';
import SvgComponent from './SvgComponent';

const ANNOTATION_HEIGHT = 8;
const LABEL_SIZE = ANNOTATION_HEIGHT * 1.5;
const ARROW_WIDTH = 5;
const ARROW_SEPARATION = 10;
const COLOR = "blue";
const IN_EXON_ARROW_COLOR = "white";

const DEFAULT_MAX_ROWS = 4;
const ROW_BOTTOM_PADDING = 5;

/*
class GeneAnnotation {
    
    name: string;
    strand: string;
    start: number;
    end: number;
    exons: []
    
}
*/

class GeneAnnotationSvg extends SvgComponent {
    _filterAndSortGenes(genes) {
        let displayRegion = this.props.model.getAbsoluteRegion();
        let visibleGenes = genes.filter(gene => gene.start < displayRegion.end && gene.end > displayRegion.start);
        return visibleGenes.sort((gene1, gene2) => gene1.start - gene2.start);
    }

    _drawGene(gene, topY) {
        let startX = this.scale.baseToX(gene.start);
        let endX = this.scale.baseToX(gene.end);
        let centerY = topY + ANNOTATION_HEIGHT / 2;
        let bottomY = topY + ANNOTATION_HEIGHT;

        // Label
        // Little extra padding when arrows point to right
        let labelX = gene.strand === "+" ? startX - ARROW_WIDTH : startX; 
        labelX -= 5;
        this.group.text(gene.name).attr({
            x: labelX,
            y: topY - ANNOTATION_HEIGHT,
            "text-anchor": "end",
            "font-size": LABEL_SIZE,
        });

        // Center line
        this.group.line(startX, centerY, endX, centerY).stroke({
            color: COLOR,
            width: 2
        });

        // Exons
        // someComponent.clipWith(exonClip) will make it show up only where the exons are.
        let exonClip = this.group.clip();
        for (let exon of gene.exons) {
            let exonBox = this.group.rect().attr({
                x: this.scale.baseToX(exon.start),
                y: topY,
                width: this.scale.basesToXWidth(exon.end - exon.start),
                height: ANNOTATION_HEIGHT,
                fill: COLOR
            });
            exonClip.add(exonBox.clone());
        }

        // Arrows
        for (let x = startX; x <= endX; x += ARROW_SEPARATION) {
            let arrowTipX = gene.strand === "+" ?
                x - ARROW_WIDTH : // Point to the right
                x + ARROW_WIDTH; // Point to the left
            let arrowPoints = [
                [arrowTipX, topY],
                [x, centerY],
                [arrowTipX, bottomY]
            ]

            // Each arrow is duplicated, but the second set will only draw inside exons.
            this.group.polyline(arrowPoints).attr({
                fill: "none",
                stroke: COLOR,
                "stroke-width": 1
            });
            this.group.polyline(arrowPoints).attr({
                fill: "none",
                stroke: IN_EXON_ARROW_COLOR,
                "stroke-width": 1
            }).clipWith(exonClip); // <-- Note the .clipWith()
        }
    } // End _drawGene

    render() {
        this.group.clear();

        let maxRows = this.props.maxRows || DEFAULT_MAX_ROWS;
        let rowXExtents = new Array(maxRows).fill(-Number.MAX_VALUE);
        let genes = this._filterAndSortGenes(this.props.data);
        let numHiddenGenes = 0;
        for (let gene of genes) {
            // Label width is approximate; I don't feel like adding one to the DOM and checking its width.
            let labelWidth = gene.name.length * LABEL_SIZE;
            let startX = this.scale.baseToX(gene.start) - labelWidth;
            let endX = this.scale.baseToX(gene.end);
            let row = rowXExtents.findIndex(rightmostX => startX > rightmostX);
            if (row === -1) {
                let y = maxRows * (ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING);
                this.group.rect().attr({
                    x: startX + labelWidth,
                    y: y,
                    width: endX - startX,
                    height: ANNOTATION_HEIGHT,
                    fill: COLOR
                });
                numHiddenGenes++;
            } else {
                rowXExtents[row] = this.scale.baseToX(gene.end);
                let y = row * (ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING);
                this._drawGene(gene, y);
            }
        }
        if (numHiddenGenes > 0) {
            let genesHiddenText = numHiddenGenes === 1 ? "1 gene unlabeled" : `${numHiddenGenes} genes unlabeled`;
            this.group.text(genesHiddenText).attr({
                x: 10,
                y: (maxRows) * (ANNOTATION_HEIGHT + ROW_BOTTOM_PADDING),
                "font-size": LABEL_SIZE,
                "font-style": "italic"
            });
        }

        return null;
    }
}

GeneAnnotationSvg.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    maxRows: PropTypes.number
}

export default GeneAnnotationSvg;
