import React from 'react';
import _ from 'lodash';
import shortid from 'shortid';
import AnnotationArrows from '../commonComponents/annotation/AnnotationArrows';
import Gene from '../../../model/Gene';
import { FeaturePlacer, PlacedFeature, PlacedSegment } from '../../../model/FeaturePlacer';

const FEATURE_PLACER = new FeaturePlacer();
const HEIGHT = 9;
const UTR_HEIGHT = 5;
export const DEFAULT_OPTIONS = {
    color: 'blue',
    backgroundColor: 'var(--bg-color)',
    categoryColors: {
        coding: 'rgb(101,1,168)',
        protein_coding: 'rgb(101,1,168)',
        nonCoding: 'rgb(1,193,75)',
        pseudogene: 'rgb(230,0,172)',
        pseudo: 'rgb(230,0,172)',
        problem: 'rgb(224,2,2)',
        polyA: 'rgb(237,127,2)',
        other: 'rgb(128,128,128)'
    },
    hiddenPixels: 0.5,
    italicizeText: false,
}

interface GeneDisplayOptions {
    color?: string;
    backgroundColor?: string;
    categoryColors?: { [category: string]: string };
}

interface GeneAnnotationProps {
    placedGene: PlacedFeature; // Gene and its placement
    options?: GeneDisplayOptions;
}

/**
 * A visualization of Gene objects.  Renders SVG elements.
 * 
 * @author Silas Hsu and Daofeng Li
 */
export class GeneAnnotation extends React.Component<GeneAnnotationProps> {
    static HEIGHT = HEIGHT;

    static getDrawColors(gene: Gene, options: GeneDisplayOptions = {}) {
        const mergedOptions = {
            ...DEFAULT_OPTIONS,
            ...options,
        };

        return {
            color: mergedOptions.categoryColors[gene.transcriptionClass] || mergedOptions.color,
            backgroundColor: mergedOptions.backgroundColor,
            italicizeText: mergedOptions.italicizeText
        };
    }

    private _exonClipId: string;

    constructor(props: GeneAnnotationProps) {
        super(props);
        this._exonClipId = _.uniqueId("GeneAnnotation");
    }

    /**
     * Renders a series of rectangles centered on the horizontal axis of the annotation.
     * 
     * @param {PlacedSegment[]} placedSegments - segments of the gene to draw
     * @param {number} height - height of all the rectangles
     * @param {string} color - color of all the rectangles
     * @return {JSX.Element[]} <rect> elements
     */
    _renderCenteredRects(placedSegments: PlacedSegment[], height: number, color: string) {
        return placedSegments.map(placedSegment => {
            const x = placedSegment.xSpan.start;
            const width = Math.max(placedSegment.xSpan.getLength(), 3); // min 3 px for exon
            return <rect key={x + shortid.generate()} x={x} y={(HEIGHT - height) / 2} width={width} height={height} fill={color} />;
        });
    }

    /**
     * Draws the annotation.
     * 
     * @return {JSX.Element}
     */
    render(): JSX.Element {
        const placedGene = this.props.placedGene;
        const gene = placedGene.feature as Gene;
        const [xStart, xEnd] = placedGene.xSpan;
        const { color, backgroundColor } = GeneAnnotation.getDrawColors(gene, this.props.options);

        const centerY = HEIGHT / 2;
        const centerLine = <line x1={xStart} y1={centerY} x2={xEnd} y2={centerY} stroke={color} strokeWidth={2} />;

        // Exons, which are split into translated and non-translated ones (i.e. utrs)
        const { translated, utrs } = gene.getExonsAsFeatureSegments();
        const placedTranslated = FEATURE_PLACER.placeFeatureSegments(placedGene, translated);
        const placedUtrs = FEATURE_PLACER.placeFeatureSegments(placedGene, utrs);
        const exonRects = this._renderCenteredRects(placedTranslated, HEIGHT, color); // These are the translated exons

        // Arrows
        // If this boolean expression confuses you, construct a truth table.  I needed one ;)
        const isToRight = gene.getIsReverseStrand() === placedGene.isReverse;
        const intronArrows = <AnnotationArrows
            startX={xStart}
            endX={xEnd}
            height={HEIGHT}
            isToRight={isToRight}
            color={color}
        />;
        // clipPath is an invisible element that defines where another element may draw.  We pass its id to exonArrows.
        const exonClip = <clipPath id={this._exonClipId} >{exonRects}</clipPath>;
        const exonArrows = <AnnotationArrows
            startX={xStart}
            endX={xEnd}
            height={HEIGHT}
            isToRight={isToRight}
            color={backgroundColor}
            clipId={this._exonClipId}
        />;

        // utrArrowCover covers up arrows where the UTRs will be
        const utrArrowCover = this._renderCenteredRects(placedUtrs, HEIGHT, backgroundColor);
        const utrRects = this._renderCenteredRects(placedUtrs, UTR_HEIGHT, color);

        return (
            <React.Fragment>
                {centerLine}
                {exonRects}
                {exonClip}
                {intronArrows}
                {exonArrows}
                {utrArrowCover}
                {utrRects}
            </React.Fragment>
        );
    }
}
