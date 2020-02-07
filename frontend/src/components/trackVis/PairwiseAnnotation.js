import React from "react";
import PropTypes from "prop-types";
import { TranslatableG } from "../TranslatableG";
import Feature from "../../model/Feature";
import OpenInterval from "../../model/interval/OpenInterval";

const HEIGHT = 9;

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
    reverseStrandColor: PropTypes.string, // Color of reverse strand annotations
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

    const [startX, endX] = xSpan;
    const width = endX - startX;
    if (width <= 0) {
      return null;
    }
    const drawWidth = Math.max(width, 0.5);
    const mainBody = (
      <rect x={startX} y={0} width={drawWidth} height={HEIGHT} fill={"red"} />
    );
    if (isMinimal) {
      return (
        <TranslatableG y={y} onClick={event => onClick(event, feature)}>
          {mainBody}
        </TranslatableG>
      );
    }

    return (
      <TranslatableG y={y} onClick={event => onClick(event, feature)}>
        {mainBody}
      </TranslatableG>
    );
  }
}

export default PairwiseAnnotation;
