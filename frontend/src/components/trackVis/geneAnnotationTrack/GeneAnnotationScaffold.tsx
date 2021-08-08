import React from "react";
import OpenInterval from "../../../model/interval/OpenInterval";
import Gene from "../../../model/Gene";
import { GeneAnnotation } from "./GeneAnnotation";
import { TranslatableG } from "../../TranslatableG";
import BackgroundedText from "../commonComponents/BackgroundedText";

interface GeneAnnotationScaffoldProps {
    gene: Gene;
    xSpan: OpenInterval; // x span of the gene segments
    viewWindow?: OpenInterval; // Used to guide placement of labels
    y?: number; // Y offset
    isMinimal?: boolean; // If true, display only a minimal box
    options?: {
        color?: string;
        backgroundColor?: string;
    };

    /**
     * Callback for click events
     *
     * @param {React.MouseEvent} event - the triggering event
     * @param {Gene} gene - the model of the clicked gene
     */
    onClick?(event: React.MouseEvent, gene: Gene): void;
}

const HEIGHT = GeneAnnotation.HEIGHT;

/**
 * A component designed to hold GeneAnnotations.  This component is responsible for drawing gene labels and listening
 * for clicks.
 *
 * @author Silas Hsu
 */
export class GeneAnnotationScaffold extends React.PureComponent<GeneAnnotationScaffoldProps> {
    static defaultProps: Partial<GeneAnnotationScaffoldProps> = {
        viewWindow: new OpenInterval(-Infinity, Infinity),
        y: 0,
        options: {},
        onClick: () => undefined,
    };

    constructor(props: GeneAnnotationScaffoldProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event: React.MouseEvent) {
        this.props.onClick(event, this.props.gene);
    }

    render(): JSX.Element {
        const { gene, xSpan, viewWindow, y, isMinimal, children } = this.props;
        const [xStart, xEnd] = xSpan;
        const { color, backgroundColor } = GeneAnnotation.getDrawColors(gene, this.props.options);

        const coveringRect = (
            <rect // Box that covers the whole annotation to increase the click area
                x={xStart}
                y={0}
                width={xSpan.getLength()}
                height={HEIGHT}
                fill={isMinimal ? color : backgroundColor}
            />
        );

        if (isMinimal) {
            // Just render a box if minimal.
            return (
                <TranslatableG y={y} onClick={this.handleClick}>
                    {coveringRect}
                </TranslatableG>
            );
        }

        const centerY = HEIGHT / 2;
        const centerLine = (
            <line x1={xStart} y1={centerY} x2={xEnd} y2={centerY} stroke={color} strokeWidth={1} strokeDasharray={4} />
        );

        // Label
        let labelX, textAnchor;
        let labelHasBackground = false;
        // Label width is approx. because calculating bounding boxes is expensive.
        const estimatedLabelWidth = gene.getName().length * HEIGHT;
        const isBlockedLeft = xStart - estimatedLabelWidth < viewWindow.start; // Label obscured if put on the left
        const isBlockedRight = xEnd + estimatedLabelWidth > viewWindow.end; // Label obscured if put on the right
        if (!isBlockedLeft) {
            // Yay, we can put it on the left!
            labelX = xStart - 4;
            textAnchor = "end";
        } else if (!isBlockedRight) {
            // Yay, we can put it on the right!
            labelX = xEnd + 4;
            textAnchor = "start";
        } else {
            // Just put it directly on top of the annotation
            labelX = viewWindow.start + 4;
            textAnchor = "start";
            labelHasBackground = true; // Need to add background for contrast purposes
        }
        // misaligned lable issue when convert to pdf
        // possible solution https://observablehq.com/@hastebrot/vertical-text-alignment-in-svg
        const label = (
            <BackgroundedText
                x={labelX}
                y={0}
                height={GeneAnnotation.HEIGHT}
                fill={color}
                // dominantBaseline="hanging"
                // dominantBaseline="auto"
                dy="0.65em"
                textAnchor={textAnchor}
                backgroundColor={backgroundColor}
                backgroundOpacity={labelHasBackground ? 0.65 : 0}
            >
                {gene.getName()}
            </BackgroundedText>
        );

        return (
            <TranslatableG y={y} onClick={this.handleClick}>
                {coveringRect}
                {centerLine}
                {children}
                {label}
            </TranslatableG>
        );
    }
}
