import React from "react";
import PropTypes from "prop-types";
import { TranslatableG } from "../TranslatableG";
import Feature from "../../model/Feature";
import OpenInterval from "../../model/interval/OpenInterval";
import BackgroundedText from "./commonComponents/BackgroundedText";
import { getContrastingColor } from "../../util";

const HEIGHT = 19;

/**
 * Visualizer for Feature objects.
 *
 * @author Silas Hsu
 */
class PairwiseAnnotation extends React.Component {
    static HEIGHT = HEIGHT;

    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // Feature to visualize
        xSpan: PropTypes.instanceOf(OpenInterval).isRequired, // x span the annotation will occupy
        y: PropTypes.number, // Y offset
        color: PropTypes.string, // Primary color to draw
        isMinimal: PropTypes.bool, // Whether to just render a plain box
        /**
         * Callback for click events.  Signature: (event: MouseEvent, feature: Feature): void
         *     `event`: the triggering click event
         *     `feature`: the same Feature as the one passed via props
         */
        segmentColors: PropTypes.object,
        onClick: PropTypes.func
    };

    static defaultProps = {
        onClick: (event, feature) => undefined
    };

    render() {
        const { feature, xSpan, y, segmentColors, isMinimal, onClick } = this.props;
        let drawColor = "blue";
        if (feature.segment.type === "mismatch") {
            drawColor = segmentColors.mismatch[feature.segment.value];
        } else {
            drawColor = segmentColors[feature.segment.type];
        }
        const contrastColor = getContrastingColor(drawColor);
        const [startX, endX] = xSpan;
        const width = endX - startX;
        if (width <= 0) {
            return null;
        }
        const drawWidth = Math.max(width, 1);
        const mainBody = <rect x={startX} y={0} width={drawWidth} height={HEIGHT} fill={drawColor} />;
        if (isMinimal) {
            return (
                <TranslatableG y={y} onClick={event => onClick(event, feature)}>
                    {mainBody}
                </TranslatableG>
            );
        }

        let label = null;
        const estimatedLabelWidth = feature.segment.value.length * HEIGHT;
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
                    backgroundColor={drawColor}
                    backgroundOpacity={1}
                >
                    {feature.segment.value}
                </BackgroundedText>
            );
        }

        return (
            <TranslatableG y={y} onClick={event => onClick(event, feature)}>
                {mainBody}
                {label}
            </TranslatableG>
        );
    }
}

export default PairwiseAnnotation;
