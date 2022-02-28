import React from "react";
import PropTypes from "prop-types";

import { TranslatableG } from "../../TranslatableG";
import AnnotationArrows from "../commonComponents/annotation/AnnotationArrows";
import BackgroundedText from "../commonComponents/BackgroundedText";

import Feature from "../../../model/Feature";
import OpenInterval from "../../../model/interval/OpenInterval";
import { getContrastingColor } from "../../../util";

const HEIGHT = 9;

/**
 * Visualizer for Feature objects.
 *
 * @author Silas Hsu
 */
class BedAnnotation extends React.Component {
    static HEIGHT = HEIGHT;

    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // Feature to visualize
        xSpan: PropTypes.instanceOf(OpenInterval).isRequired, // x span the annotation will occupy
        y: PropTypes.number, // Y offset
        color: PropTypes.string, // Primary color to draw
        reverseStrandColor: PropTypes.string, // Color of reverse strand annotations
        isMinimal: PropTypes.bool, // Whether to just render a plain box
        isInvertArrowDirection: PropTypes.bool, // Whether to reverse any arrow directions
        /**
         * Callback for click events.  Signature: (event: MouseEvent, feature: Feature): void
         *     `event`: the triggering click event
         *     `feature`: the same Feature as the one passed via props
         */
        onClick: PropTypes.func,
        opacity: PropTypes.number,
    };

    static defaultProps = {
        color: "blue",
        reverseStrandColor: "red",
        isInvertArrowDirection: false,
        opacity: 1,
        onClick: (event, feature) => undefined,
    };

    render() {
        const {
            feature,
            xSpan,
            y,
            color,
            reverseStrandColor,
            isMinimal,
            isInvertArrowDirection,
            onClick,
            alwaysDrawLabel,
            hiddenPixels,
            opacity,
        } = this.props;
        const colorToUse = feature.getIsReverseStrand() ? reverseStrandColor : color;
        const contrastColor = getContrastingColor(colorToUse);
        const [startX, endX] = xSpan;
        const width2 = endX - startX;
        const width = alwaysDrawLabel ? Math.max(3, width2) : width2;
        if (width < hiddenPixels) {
            return null;
        }

        const mainBody = <rect x={startX} y={0} width={width} height={HEIGHT} fill={colorToUse} opacity={opacity} />;
        if (isMinimal) {
            return (
                <TranslatableG y={y} onClick={(event) => onClick(event, feature)}>
                    {mainBody}
                </TranslatableG>
            );
        }

        let arrows = null;
        if (feature.getHasStrand()) {
            arrows = (
                <AnnotationArrows
                    startX={startX}
                    endX={endX}
                    height={HEIGHT}
                    // If this boolean expression confuses you, construct a truth table.  I needed one ;)
                    isToRight={feature.getIsReverseStrand() === isInvertArrowDirection}
                    color={contrastColor}
                    opacity={opacity}
                />
            );
        }

        let label = null;
        const estimatedLabelWidth = feature.getName().length * HEIGHT;
        if (estimatedLabelWidth < 0.5 * width) {
            const centerX = startX + 0.5 * width;
            label = (
                <BackgroundedText
                    x={centerX}
                    y={0}
                    height={HEIGHT - 1}
                    fill={contrastColor}
                    dominantBaseline="hanging"
                    textAnchor="middle"
                    backgroundColor={colorToUse}
                    backgroundOpacity={1}
                >
                    {feature.getName()}
                </BackgroundedText>
            );
        } else if (alwaysDrawLabel) {
            label = (
                <BackgroundedText
                    x={endX + 4} // 4px space between rect and text label
                    y={0}
                    height={HEIGHT - 1}
                    fill={colorToUse}
                    dominantBaseline="hanging"
                    textAnchor="start"
                >
                    {feature.getName()}
                </BackgroundedText>
            );
        }

        return (
            <TranslatableG y={y} onClick={(event) => onClick(event, feature)}>
                {mainBody}
                {arrows}
                {label}
            </TranslatableG>
        );
    }
}

export default BedAnnotation;
