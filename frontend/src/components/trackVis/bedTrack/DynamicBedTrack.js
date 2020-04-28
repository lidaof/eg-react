import React from "react";
import memoizeOne from "memoize-one";
import _ from "lodash";
import { withTooltip } from "../commonComponents/tooltip/withTooltip";
import FeatureArranger from "model/FeatureArranger";
import Track from "../commonComponents/Track";
import TrackLegend from "../commonComponents/TrackLegend";
import { PixiAnnotation } from "../PixiAnnotation";

export const TOP_PADDING = 2;
export const ROW_VERTICAL_PADDING = 2;

export const DEFAULT_OPTIONS = {
    color: "blue",
    color2: "red",
    rowHeight: 10,
    maxRows: 5,
    hiddenPixels: 0.5,
    speed: [5],
    playing: true,
};

/**
 * Dynamic bed track.
 *
 * @author Daofeng Li
 */
class DynamicBedTrackNoTooltip extends React.Component {
    constructor(props) {
        super(props);
        this.featureArranger = new FeatureArranger();
        this.featureArranger.arrange = memoizeOne(this.featureArranger.arrange);
    }

    getBedPadding = (bed) => bed.getName().length * this.props.options.rowHeight + 2;

    getHeight = (results) => {
        const { options } = this.props;
        const maxRow = _.max(results.map((r) => r.numRowsAssigned));
        let rowsToDraw = Math.min(maxRow, options.maxRows);
        if (rowsToDraw < 1) {
            rowsToDraw = 1;
        }
        return rowsToDraw * (options.rowHeight + ROW_VERTICAL_PADDING) + TOP_PADDING;
    };

    render() {
        const { data, visRegion, viewWindow, width, options, trackModel } = this.props;
        const arrangeResults = data.map((d) =>
            this.featureArranger.arrange(d, visRegion, width, this.getBedPadding, options.hiddenPixels)
        );
        const height = this.getHeight(arrangeResults) || options.rowHeight + TOP_PADDING;
        const legend = <TrackLegend height={height} trackModel={this.props.trackModel} />;
        const visualizer = (
            <PixiAnnotation
                arrangeResults={arrangeResults}
                width={width}
                height={height}
                rowHeight={options.rowHeight}
                maxRows={options.maxRows}
                viewWindow={viewWindow}
                backgroundColor={options.backgroundColor}
                color={options.color}
                color2={options.color2}
                speed={options.speed}
                playing={options.playing}
                trackModel={trackModel}
            />
        );
        const message = <React.Fragment>{this.props.message}</React.Fragment>;
        return <Track {...this.props} legend={legend} visualizer={visualizer} message={message} />;
    }
}

export const DynamicBedTrack = withTooltip(DynamicBedTrackNoTooltip);
