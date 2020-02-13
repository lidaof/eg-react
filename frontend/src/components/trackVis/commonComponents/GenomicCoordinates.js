import React from "react";
import PropTypes from "prop-types";

import DisplayedRegionModel from "../../../model/DisplayedRegionModel";
import LinearDrawingModel from "../../../model/LinearDrawingModel";
import NavigationContext from "../../../model/NavigationContext";

/**
 * Calculates genomic coordinates at a page coordinate and displays them.
 *
 * @author Silas Hsu
 */
class GenomicCoordinates extends React.Component {
  static propTypes = {
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired
  };

  /**
   * @inheritdoc
   */
  render() {
    const { viewRegion, width, x } = this.props;
    const drawModel = new LinearDrawingModel(viewRegion, width);
    let segment;
    try {
      segment = drawModel.xToSegmentCoordinate(x);
    } catch (error) {
      return null;
    }
    if (NavigationContext.isGapFeature(segment.feature)) {
      return segment.getName();
    } else {
      const locus = segment.getLocus();
      return `${locus.chr}:${Math.floor(locus.start)}`;
    }
  }
}

export default GenomicCoordinates;
