import React from "react";

import { PropsFromTrackContainer } from "../commonComponents/Track";
import FeatureDetail from "../commonComponents/annotation/FeatureDetail";
import Tooltip from "../commonComponents/tooltip/Tooltip";
import { withTooltip, TooltipCallbacks } from "../commonComponents/tooltip/withTooltip";
import { Feature } from "../../../model/Feature";
import OpenInterval from "model/interval/OpenInterval";
import configOptionMerging from "../commonComponents/configOptionMerging";
import Track from "../commonComponents/Track";
import TrackLegend from "../commonComponents/TrackLegend";


interface GraphTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: Feature[];
    options: {
        color?: string;
        color2?: string;
        alwaysDrawLabel?: boolean;
        hiddenPixels?: number;
    };
}

export const DEFAULT_OPTIONS = {
    hiddenPixels: 0.5,
}

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * Track component for BED annotations.
 *
 * @author Silas Hsu
 */
class GraphTrackNoTooltip extends React.Component<GraphTrackProps> {
    static displayName = "GraphTrack";

    constructor(props: GraphTrackProps) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    /**
     * Renders the tooltip for a feature.
     *
     * @param {React.MouseEvent} event - mouse event that triggered the tooltip request
     * @param {Feature} feature - Feature for which to display details
     */
    renderTooltip(event: React.MouseEvent, feature: Feature) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip}>
                <FeatureDetail feature={feature} />
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    paddingFunc = (feature: Feature, xSpan: OpenInterval) => {
        const width = xSpan.end - xSpan.start;
        const estimatedLabelWidth = feature.getName().length * 9;
        if (estimatedLabelWidth < 0.5 * width) {
            return 5;
        } else {
            return 9 + estimatedLabelWidth;
        }
    };


    /**
     * graph rendering logic roughly:
     * we put nodes into 3 types
     * type 1: nodes in current view region
     * type 2: nodes outside of view region, but can be found in genome, called locatable nodes
     * type 3: nodes not in this genome (contigs or other genome), called non-locatable nodes
     * 3 row chunks should be created for each type,
     * type 1 and 2 nodes can optionally be decorated with other track data
     * and links should be created for nodes
     * @returns 
     */
    render() {
        const visualizer = <div>hello</div>
        const message = <p>test</p>
        return (
            <Track
                {...this.props}
                legend={<TrackLegend trackModel={this.props.trackModel} height={500} />}
                visualizer={visualizer}
                message={message}
            />
        );
    }
}

export const GraphTrack = withDefaultOptions(withTooltip(GraphTrackNoTooltip as any));
