import React from "react";
import PropTypes from "prop-types";
import { TranslatableG } from "../../TranslatableG";
import BackgroundedText from "../commonComponents/BackgroundedText";
import OpenInterval from "../../../model/interval/OpenInterval";
import { getContrastingColor } from "../../../util";
import Vcf from "model/Vcf";

/**
 * Visualizer for VCF objects.
 *
 * @author Daofeng Li
 */
class VcfAnnotation extends React.Component {
    static propTypes = {
        feature: PropTypes.instanceOf(Vcf).isRequired, // Feature to visualize
        xSpan: PropTypes.instanceOf(OpenInterval).isRequired, // x span the annotation will occupy
        y: PropTypes.number, // Y offset
        height: PropTypes.number, // Y offset
        colorScale: PropTypes.any, // colos scale
        reverseStrandColor: PropTypes.string, // Color of reverse strand annotations
        isMinimal: PropTypes.bool, // Whether to just render a plain box
        /**
         * Callback for click events.  Signature: (event: MouseEvent, feature: Feature): void
         *     `event`: the triggering click event
         *     `feature`: the same Feature as the one passed via props
         */
        onClick: PropTypes.func,
    };

    static defaultProps = {
        onClick: (event, feature) => undefined,
    };

    render() {
        const { feature, xSpan, y, height, colorScale, isMinimal, onClick, alwaysDrawLabel } = this.props;
        const colorToUse = colorScale(feature.variant.QUAL);
        const contrastColor = getContrastingColor(colorToUse);
        const [startX, endX] = xSpan;
        const width2 = endX - startX;
        const width = Math.max(2, width2);
        const mainBody = <rect x={startX} y={0} width={width} height={height} fill={colorToUse} />;
        if (isMinimal) {
            return (
                <TranslatableG y={y} onClick={(event) => onClick(event, feature)}>
                    {mainBody}
                </TranslatableG>
            );
        }

        let label = null;
        const estimatedLabelWidth = feature.getName().length * height;
        if (estimatedLabelWidth < 0.5 * width) {
            const centerX = startX + 0.5 * width;
            label = (
                <BackgroundedText
                    x={centerX}
                    y={0}
                    height={height - 1}
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
                    height={height - 1}
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
                {label}
            </TranslatableG>
        );
    }
}

export default VcfAnnotation;
