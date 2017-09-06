import PropTypes from 'prop-types';
import SvgComponent from '../SvgComponent';

export const ANNOTATION_HEIGHT = 8;
export const LABEL_SIZE = ANNOTATION_HEIGHT * 1.5;

const ARROW_WIDTH = 5;
const ARROW_SEPARATION = 10;
const COLOR = "blue";
const IN_EXON_ARROW_COLOR = "white";

export class GeneAnnotation extends SvgComponent {
    onClick(event) {
        if (this.props.onClick) {
            this.props.onClick(event, this.props.gene);
            event.stopPropagation();
        }
    }

    componentDidMount() {
        this.group.on("click", this.onClick.bind(this));
    }

    render() {
        this.group.clear();

        const startX = this.scale.baseToX(this.props.gene.start);
        const endX = this.scale.baseToX(this.props.gene.end);
        const centerY = this.props.topY + ANNOTATION_HEIGHT / 2;
        const bottomY = this.props.topY + ANNOTATION_HEIGHT;

        // Box that covers the whole annotation to increase the click area
        let coveringBox = this.group.rect().attr({
            x: startX,
            y: this.props.topY,
            width: endX - startX,
            height: ANNOTATION_HEIGHT
        });
        if (!this.props.isLabeled) { // Unlabeled: just fill the box and end there
            coveringBox.fill(COLOR);
            return null;
        } else {
            coveringBox.opacity(0);
        }

        // Label
        // Add a little more right padding depending on the arrow direction
        let labelX = this.props.gene.strand === "+" ? startX - ARROW_WIDTH : startX;
        labelX -= 5;
        this.group.text(this.props.gene.name).attr({
            x: labelX,
            y: this.props.topY - ANNOTATION_HEIGHT,
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
        for (let exon of this.props.gene.exons) {
            let exonBox = this.group.rect().attr({
                x: this.scale.baseToX(exon.start),
                y: this.props.topY,
                width: this.scale.basesToXWidth(exon.end - exon.start),
                height: ANNOTATION_HEIGHT,
                fill: COLOR
            });
            exonClip.add(exonBox.clone());
        }

        // Arrows
        for (let x = startX; x <= endX; x += ARROW_SEPARATION) {
            let arrowTipX = this.props.gene.strand === "+" ?
                x - ARROW_WIDTH : // Point to the right
                x + ARROW_WIDTH; // Point to the left
            let arrowPoints = [
                [arrowTipX, this.props.topY],
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

        return null;
    }
}

export default GeneAnnotation;

GeneAnnotation.propTypes = {
    gene: PropTypes.object.isRequired,
    isLabeled: PropTypes.bool.isRequired,
    topY: PropTypes.number.isRequired,
    onClick: PropTypes.func,
}
