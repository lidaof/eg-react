import React from "react";
import PropTypes from "prop-types";
import { TranslatableG } from "../../TranslatableG";
import { Fiber } from "../../../model/Feature";
import OpenInterval from "../../../model/interval/OpenInterval";
import { getContrastingColor } from "../../../util";

const HEIGHT = 9;

/**
 * Visualizer for Feature objects.
 *
 * @author Silas Hsu
 */
class FiberAnnotation extends React.Component {
    static HEIGHT = HEIGHT;

    static propTypes = {
        fiber: PropTypes.instanceOf(Fiber).isRequired, // Feature to visualize
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
            fiber,
            xSpan,
            y,
            color,
            reverseStrandColor,
            isMinimal,
            onClick,
            hiddenPixels,
            opacity,
        } = this.props;
        const colorToUse = fiber.getIsReverseStrand() ? reverseStrandColor : color;
        const contrastColor = getContrastingColor(colorToUse);
        const [startX, endX] = xSpan;
        const width = endX - startX;
        if (width < hiddenPixels) {
            return null;
        }

        const mainBody = <rect x={startX} y={0} width={width} height={HEIGHT} fill={colorToUse} opacity={opacity} />;
        if (isMinimal) {
            return (
                <TranslatableG y={y} onClick={(event) => onClick(event, fiber)}>
                    {mainBody}
                </TranslatableG>
            );
        }

        const blocks = [];
        // console.log(fiber)
        fiber.blockStarts.forEach((bs,idx) => {
            const blockStart = startX * (fiber.locus.start + bs)/fiber.locus.start;
            const blockWidth = (1 / fiber.getLength()) * width;
            blocks.push(<rect key={idx} x={blockStart} y={0} width={blockWidth} height={HEIGHT} fill='yellow' opacity={opacity} />)
        })

        return (
            <TranslatableG y={y} onClick={(event) => onClick(event, fiber)}>
                {mainBody}
                {blocks}
            </TranslatableG>
        );
    }
}

export default FiberAnnotation;
