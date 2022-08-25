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
import { HiddenItemsMessage } from "../commonComponents/TrackMessage";
import { GraphVisualizer } from "./GraphVisualizer";


interface GraphTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: any;
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
 * Track component for graph track.
 *
 * @author Daofeng Li
 */
class GraphTrackNoTooltip extends React.Component<GraphTrackProps> {
    static displayName = "GraphTrack";

    constructor(props: GraphTrackProps) {
        super(props);
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
        const { data, visRegion, width, options } = this.props;
        const height = 500//this.getHeight(arrangeResult.numRowsAssigned);
        const visualizer = data.nodes ? <GraphVisualizer
            data={data}
            width={width}
            height={height}
            options={options}
        /> : <div>loading...</div>
        const message = <React.Fragment>
            <HiddenItemsMessage numHidden={1} />
            {'hello'}
        </React.Fragment>;
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
