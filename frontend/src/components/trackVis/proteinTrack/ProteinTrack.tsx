import React from "react";

import Protein from "./Protein";
import { PropsFromTrackContainer } from "../commonComponents/Track";
import AnnotationTrack from "../commonComponents/annotation/AnnotationTrack";
import FeatureDetail from "../commonComponents/annotation/FeatureDetail";
import Tooltip from "../commonComponents/tooltip/Tooltip";
import {
  withTooltip,
  TooltipCallbacks
} from "../commonComponents/tooltip/withTooltip";
import { Feature } from "../../../model/Feature";
import { PlacedFeatureGroup } from "../../../model/FeatureArranger";

const ROW_VERTICAL_PADDING = 2;
const ROW_HEIGHT = Protein.HEIGHT + ROW_VERTICAL_PADDING;

interface ProteinTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
  data: Feature[];
  options: {
    color?: string;
    color2?: string;
  };
}

/**
 * Track component for BED annotations.
 *
 * @author Silas Hsu
 */
class ProteinTrackNoTooltip extends React.Component<ProteinTrackProps> {
  static displayName = "ProteinTrack";

  constructor(props: ProteinTrackProps) {
    super(props);
    this.renderTooltip = this.renderTooltip.bind(this);
    this.renderProtein = this.renderProtein.bind(this);
  }

  /**
   * Renders the tooltip for a feature.
   *
   * @param {React.MouseEvent} event - mouse event that triggered the tooltip request
   * @param {Feature} feature - Feature for which to display details
   */
  renderTooltip(event: React.MouseEvent, feature: Feature) {
    const tooltip = (
      <Tooltip
        pageX={event.pageX}
        pageY={event.pageY}
        onClose={this.props.onHideTooltip}
      >
        <FeatureDetail feature={feature} />
      </Tooltip>
    );
    this.props.onShowTooltip(tooltip);
  }

  /**
   * Renders one annotation.
   *
   * @param {PlacedFeature} - feature and drawing info
   * @param {number} y - y coordinate to render the annotation
   * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
   * @param {number} index - iteration index
   * @return {JSX.Element} element visualizing the feature
   */
  renderProtein(
    placedGroup: PlacedFeatureGroup,
    y: number,
    isLastRow: boolean,
    index: number
  ) {
    return placedGroup.placedFeatures.map((placement, i) => (
      <Protein
        key={i}
        feature={placement.feature}
        xSpan={placement.xSpan}
        y={y}
        isMinimal={isLastRow}
        color={this.props.options.color}
        reverseStrandColor={this.props.options.color2}
        isInvertArrowDirection={placement.isReverse}
        onClick={this.renderTooltip}
      />
    ));
  }

  render() {
    return (
      <AnnotationTrack
        {...this.props}
        rowHeight={ROW_HEIGHT}
        getAnnotationElement={this.renderProtein}
      />
    );
  }
}

export const ProteinTrack = withTooltip(ProteinTrackNoTooltip as any);
