import React from 'react';
import PropTypes from 'prop-types';

import withSvgJs from '../../withSvgJs';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';

export const ANNOTATION_HEIGHT = 8;
export const LABEL_SIZE = ANNOTATION_HEIGHT * 1.5;

const ARROW_WIDTH = 5;
const ARROW_SEPARATION = 10;
const COLOR = "blue";
const IN_EXON_ARROW_COLOR = "white";

const LABEL_BACKGROUND_PADDING = 2;

/**
 * A single annotation for the gene annotation track.
 * 
 * @author Silas Hsu
 */
class _GeneAnnotation extends React.Component {
    static propTypes = {
        gene: PropTypes.object.isRequired, // Gene to display
        isLabeled: PropTypes.bool.isRequired, // Whether to display the gene's name
        topY: PropTypes.number.isRequired, // The y coordinate of the top edge of the annotation
        leftBoundary: PropTypes.number.isRequired, // The x coordinate of the SVG's left boundary
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel), // Current view region

        /**
         * Called when this annotation is clicked.  Has the signature
         *     (event: React.SyntheticEvent, gene: Gene): void
         *         `event`: the mouse event from the click
         *         `gene`: the Gene object that was clicked, same as this.props.gene
         */
        onClick: PropTypes.func,
    };

    /**
     * Called when the annotation is clicked; executes the onClick callback provided via props.
     * 
     * @param {MouseEvent} event - MouseEvent from clicking this annotation
     */
    onClick(event) {
        if (this.props.onClick) {
            this.props.onClick(event, this.props.gene);
            event.stopPropagation();
        }
    }

    /**
     * Binds event listeners.
     * 
     * @override
     */
    componentDidMount() {
        this.props.group.on("click", this.onClick.bind(this));
        this.props.group.on("mousedown", event => event.stopPropagation());
    }

    /**
     * Draws the annotation.
     * 
     * @override
     */
    render() {
        this.props.group.clear();
        let gene = this.props.gene;
        const details = gene.getDetails();

        const startX = this.props.drawModel.baseToX(gene.absStart);
        const endX = this.props.drawModel.baseToX(gene.absEnd);
        const centerY = this.props.topY + ANNOTATION_HEIGHT / 2;
        const bottomY = this.props.topY + ANNOTATION_HEIGHT;

        // Box that covers the whole annotation to increase the click area
        let coveringBox = this.props.group.rect(endX - startX, ANNOTATION_HEIGHT).attr({
            x: startX,
            y: this.props.topY,
        });
        if (!this.props.isLabeled) { // Unlabeled: just fill the box and end there
            coveringBox.fill(COLOR);
            return null;
        } else {
            coveringBox.opacity(0);
        }

        // Center line
        this.props.group.line(startX, centerY, endX, centerY).stroke({
            color: COLOR,
            width: 2
        });

        // Exons
        // someComponent.clipWith(exonClip) will make it show up only where the exons are.
        let exonClip = this.props.group.clip();
        for (let exon of details.absExons) {
            let exonBox = this.props.group.rect(this.props.drawModel.basesToXWidth(exon.end - exon.start), ANNOTATION_HEIGHT);
            exonBox.attr({
                x: this.props.drawModel.baseToX(exon.start),
                y: this.props.topY,
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
                [arrowTipX, this.props.topY],
                [x, centerY],
                [arrowTipX, bottomY]
            ]

            // Each arrow is duplicated, but the second set will only draw inside exons.
            this.props.group.polyline(arrowPoints).attr({
                fill: "none",
                stroke: COLOR,
                "stroke-width": 1
            });
            this.props.group.polyline(arrowPoints).attr({
                fill: "none",
                stroke: IN_EXON_ARROW_COLOR,
                "stroke-width": 1
            }).clipWith(exonClip); // <-- Note the .clipWith()
        }

        // Label
        let labelX, textAnchor;
        // Label width is approx. because calculating bounding boxes is expensive.
        let estimatedLabelWidth = gene.getName().length * ANNOTATION_HEIGHT;
        if (gene.getIsInView(this.props.viewRegion) && startX - estimatedLabelWidth < this.props.leftBoundary) {
            // It's going to go off the screen; we need to move the label
            labelX = this.props.leftBoundary;
            textAnchor = "start";
            // Add highlighting, as the label will overlap the other stuff
            this.props.group.rect(estimatedLabelWidth + LABEL_BACKGROUND_PADDING * 2, ANNOTATION_HEIGHT).attr({
                x: this.props.leftBoundary - LABEL_BACKGROUND_PADDING,
                y: this.props.topY,
                fill: "white",
                opacity: 0.65,
            });
        } else {
            labelX = (details.strand === "+" ? startX - ARROW_WIDTH : startX) - 5;
            textAnchor = "end";
        }

        this.props.group.text(gene.getName()).attr({
            x: labelX,
            y: this.props.topY - ANNOTATION_HEIGHT,
            "text-anchor": textAnchor,
            "font-size": LABEL_SIZE,
        });

        return null;
    }
}

export const GeneAnnotation = withSvgJs(_GeneAnnotation);
export default GeneAnnotation;
