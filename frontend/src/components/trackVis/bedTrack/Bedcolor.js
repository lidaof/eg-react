import React from "react";
import PropTypes from "prop-types";
import { TranslatableG } from "../../TranslatableG";
import { ColoredFeature } from "../../../model/Feature";
import OpenInterval from "../../../model/interval/OpenInterval";

/**
 * Visualizer for Feature objects.
 *
 * @author Silas Hsu
 */
class Bedcolor extends React.Component {
    static propTypes = {
        feature: PropTypes.instanceOf(ColoredFeature).isRequired, // Feature to visualize
        xSpan: PropTypes.instanceOf(OpenInterval).isRequired, // x span the annotation will occupy
        y: PropTypes.number, // Y offset
        height: PropTypes.number,
        isMinimal: PropTypes.bool, // Whether to just render a plain box
        /**
         * Callback for click events.  Signature: (event: MouseEvent, feature: Feature): void
         *     `event`: the triggering click event
         *     `feature`: the same Feature as the one passed via props
         */
        onClick: PropTypes.func,
    };

    static defaultProps = {
        isInvertArrowDirection: false,
        onClick: (event, feature) => undefined,
    };

    render() {
        const { feature, xSpan, y, isMinimal, onClick, height } = this.props;
        const [startX, endX] = xSpan;
        const width = endX - startX;
        if (width <= 0) {
            return null;
        }

        const mainBody = <rect x={startX} y={0} width={width} height={height} fill={feature.color} />;
        if (isMinimal) {
            return (
                <TranslatableG y={y} onClick={(event) => onClick(event, feature)}>
                    {mainBody}
                </TranslatableG>
            );
        }

        return (
            <TranslatableG y={y} onClick={(event) => onClick(event, feature)}>
                {mainBody}
            </TranslatableG>
        );
    }
}

export default Bedcolor;
