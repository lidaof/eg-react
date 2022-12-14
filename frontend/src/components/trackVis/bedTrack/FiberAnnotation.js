import React from "react";
import PropTypes from "prop-types";
// import { PlacedFeature } from "../../../model/FeaturePlacer";
import { TranslatableG } from "../../TranslatableG";

const HEIGHT = 9;

/**
 * Visualizer for Feature objects.
 *
 * @author Silas Hsu
 */
class FiberAnnotation extends React.Component {
    static HEIGHT = HEIGHT;

    static propTypes = {
        // placement: PropTypes.instanceOf(PlacedFeature).isRequired, // fiber segment to visualize
        placement: PropTypes.object.isRequired, // fiber segment to visualize
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
        const { placement, y, color, reverseStrandColor, isMinimal, onClick, hiddenPixels, opacity } = this.props;
        const { feature, xSpan, visiblePart } = placement;
        const { relativeStart, relativeEnd } = visiblePart;
        const segmentWidth = relativeEnd - relativeStart;
        const colorToUse = feature.getIsReverseStrand() ? reverseStrandColor : color;
        const [startX, endX] = xSpan;
        const width = endX - startX;
        if (width < hiddenPixels) {
            return null;
        }

        const mainBody = <rect x={startX} y={0} width={width} height={HEIGHT} fill={colorToUse} opacity={0.7} />;
        if (isMinimal) {
            return (
                <TranslatableG y={y} onClick={(event) => onClick(event, feature)}>
                    {mainBody}
                </TranslatableG>
            );
        }

        const blocks = [];
        feature.blockStarts.forEach((bs, idx) => {
            if (bs >= relativeStart && bs <= relativeEnd) {
                const blockStart = startX + ((bs - relativeStart) / segmentWidth) * width;
                const blockWidth = (1 / segmentWidth) * width;
                blocks.push(
                    <rect
                        key={idx}
                        x={blockStart}
                        y={0}
                        width={blockWidth}
                        height={HEIGHT}
                        fill="yellow"
                        opacity={opacity}
                    />
                );
            }
        });

        return (
            <TranslatableG y={y} onClick={(event) => onClick(event, feature)}>
                {mainBody}
                {blocks}
            </TranslatableG>
        );
    }
}

export default FiberAnnotation;
