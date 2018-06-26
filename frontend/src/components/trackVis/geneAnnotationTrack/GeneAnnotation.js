import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import TranslatableG from '../../TranslatableG';
import AnnotationArrows from '../commonComponents/annotation/AnnotationArrows';
import BackgroundedText from '../commonComponents/BackgroundedText';

import LinearDrawingModel from '../../../model/LinearDrawingModel';
import Gene from '../../../model/Gene';
import OpenInterval from '../../../model/interval/OpenInterval';
import DisplayedRegionModel from '../../../model/DisplayedRegionModel';

const HEIGHT = 9;
const UTR_HEIGHT = 5;
const DEFAULT_COLOR = "blue";
const DEFAULT_BACKGROUND_COLOR = "white";
export const DEFAULT_CATEGORY_COLORS = {
    coding: 'rgb(0,60,179)',
    nonCoding: 'rgb(0,128,0)',
    pseudogene: 'rgb(230,0,172)',
    problem: 'rgb(255,0,0)',
    polyA: 'rgb(0,0,51)'
};

/**
 * A visualization of Gene objects.  Renders SVG elements.
 * 
 * @author Silas Hsu and Daofeng Li
 */
class GeneAnnotation extends React.Component {
    static HEIGHT = HEIGHT;

    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // Gene structure to draw
        navContextLocation: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Location of gene in nav context
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // Drawing model
        y: PropTypes.number, // y offset
        /**
         * x range of visible pixels, used for label positioning.  By default, assumes all pixels are visible.
         */
        viewWindow: PropTypes.instanceOf(OpenInterval),
        isMinimal: PropTypes.bool, // If true, display only a minimal box
        options: PropTypes.shape({
            color: PropTypes.string,
            backgroundColor: PropTypes.string,
        }),
        /**
         * Callback for click events.  Signature: (event: MouseEvent, gene: Gene): void
         *     `event`: the triggering click event
         *     `gene`: the same Gene as the one passed via props
         */
        onClick: PropTypes.func,
    };

    static defaultProps = {
        y: 0,
        viewWindow: new OpenInterval(-Infinity, Infinity),
        isMinimal: false,
        isRenderLabel: true,
        options: {},
        onClick: (event, gene) => undefined
    };

    constructor(props) {
        super(props);
        this.state = {
            exonClipId: _.uniqueId("GeneAnnotation")
        };
    }

    /**
     * Renders a series of rectangles centered on the horizontal axis of the annotation.
     * @param {OpenInterval[]} absIntervals - nav context intervals in which to draw
     * @param {number} height - height of all the rectangles
     * @param {string} color - color of all the rectangles
     * @return {JSX.Element[]} <rect> elements
     */
    renderCenteredRects(absIntervals, height, color) {
        const drawModel = this.props.drawModel;
        return absIntervals.map(interval => {
            const x = drawModel.baseToX(interval.start);
            const width = drawModel.basesToXWidth(interval.getLength());
            return <rect key={x} x={x} y={(HEIGHT - height) / 2} width={width} height={height} fill={color} />;
        });
    }

    /**
     * Draws the annotation.
     * 
     * @return {null}
     * @override
     */
    render() {
        const {gene, navContextLocation, drawModel, y, viewWindow, isMinimal, options, onClick} = this.props;
        const absLocation = navContextLocation.getAbsoluteRegion();
        const exonClipId = this.state.exonClipId;
        const categoryColors = options.categoryColors || DEFAULT_CATEGORY_COLORS;
        const color = categoryColors[gene.transcriptionClass] || options.color || DEFAULT_COLOR;
        const backgroundColor = options.backgroundColor || DEFAULT_BACKGROUND_COLOR;
        const startX = Math.max(-1, drawModel.baseToX(absLocation.start));
        const endX = Math.min(drawModel.baseToX(absLocation.end), drawModel.getDrawWidth() + 1);
        const containerProps = {
            y: y,
            onClick: event => onClick(event, gene)
        };

        if (endX - startX < 0) {
            return null;
        }

        const coveringRect = <rect // Box that covers the whole annotation to increase the click area
            x={startX}
            y={0}
            width={endX - startX}
            height={HEIGHT}
            fill={isMinimal ? color : backgroundColor}
        />;
        if (isMinimal) { // Just render a box if minimal.
            return <TranslatableG {...containerProps} >{coveringRect}</TranslatableG>;
        }

        const centerY = HEIGHT / 2;
        const centerLine = <line x1={startX} y1={centerY} x2={endX} y2={centerY} stroke={color} strokeWidth={2} />;

        // Exons, which are split into translated and non-translated ones (i.e. utrs)
        const {absTranslated, absUtrs} = gene.getAbsExons(navContextLocation);
        const exons = this.renderCenteredRects(absTranslated, HEIGHT, color); // These are the translated exons

        const isToRight = gene.getIsForwardStrand();
        const intronArrows = <AnnotationArrows
            startX={startX}
            endX={endX}
            height={HEIGHT}
            isToRight={isToRight}
            color={color}
        />;
        // clipPath is an invisible element that defines where another element may draw.  We pass its id to exonArrows.
        const exonClip = <clipPath id={exonClipId} >{exons}</clipPath>;
        const exonArrows = <AnnotationArrows
            startX={startX}
            endX={endX}
            height={HEIGHT}
            isToRight={isToRight}
            color={backgroundColor}
            clipId={exonClipId}
        />;

        // utrArrowCover covers up arrows where the UTRs will be
        const utrArrowCover = this.renderCenteredRects(absUtrs, HEIGHT, backgroundColor);
        const utrs = this.renderCenteredRects(absUtrs, UTR_HEIGHT, color);

        // Label
        let labelX, textAnchor;
        let labelHasBackground = false;
        // Label width is approx. because calculating bounding boxes is expensive.
        const estimatedLabelWidth = gene.getName().length * HEIGHT;
        const isBlockedLeft = startX - estimatedLabelWidth < viewWindow.start; // Label obscured if put on the left
        const isBlockedRight = endX + estimatedLabelWidth > viewWindow.end; // Label obscured if put on the right
        if (!isBlockedLeft) { // Yay, we can put it on the left!
            labelX = startX - 1;
            textAnchor = "end";
        } else if (!isBlockedRight) { // Yay, we can put it on the right!
            labelX = endX + 1;
            textAnchor = "start";
        } else { // Just put it directly on top of the annotation
            labelX = viewWindow.start + 1;
            textAnchor = "start";
            labelHasBackground = true; // Need to add background for contrast purposes
        }
        const label = (
            <BackgroundedText
                x={labelX}
                y={0}
                height={HEIGHT}
                fill={color}
                alignmentBaseline="hanging"
                textAnchor={textAnchor}
                backgroundColor={backgroundColor}
                backgroundOpacity={labelHasBackground ? 0.65 : 0}
            >
                {gene.getName()}
            </BackgroundedText>
        );

        return (
        <TranslatableG {...containerProps} >
            {coveringRect}
            {centerLine}
            {exons}
            {exonClip}
            {intronArrows}
            {exonArrows}
            {utrArrowCover}
            {utrs}
            {this.props.isRenderLabel && label}
        </TranslatableG>
        );
    }
}

export default GeneAnnotation;
