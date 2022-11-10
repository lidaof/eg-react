import React from "react";
import { PropsFromTrackContainer } from "../commonComponents/Track";
import { withTooltip, TooltipCallbacks } from "../commonComponents/tooltip/withTooltip";
import configOptionMerging from "../commonComponents/configOptionMerging";
import { GraphDisplayModes } from 'model/DisplayModes';
import { GraphFullMode } from "./GraphFullMode";
import { HengGraphVisualizer } from "./HengGraphVisualizer";
import { GraphDensityMode } from "./GraphDensityMode";


interface GraphTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: any;
    options: {
        color?: string;
        color2?: string;
        alwaysDrawLabel?: boolean;
        rowHeight: number;
        ySkip: number;
        displayMode: string;
        height: number; //only in density mode
    };
}

export const DEFAULT_OPTIONS = {
    rowHeight: 10,
    ySkip: 20,
    height: 100,
    displayMode: GraphDisplayModes.FULL,
}

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * Track component for graph track.
 *
 * @author Daofeng Li
 */
class GraphTrackNoTooltip extends React.Component<GraphTrackProps> {
    static displayName = "GraphTrack";

    // constructor(props: GraphTrackProps) {
    //     super(props);
    // }


    /**
     * graph rendering logic roughly: (full mode)
     * we put nodes into 3 types
     * type 0: nodes in current view region
     * type 1: nodes outside of view region, but can be found in genome, called locatable nodes
     * type 2: nodes not in this genome (contigs or other genome), called non-locatable nodes
     * 3 row chunks should be created for each type,
     * type 0 and 1 nodes can optionally be decorated with other track data
     * and links should be created for nodes
     * 
     * density mode, rach placed node with stack bar chart, 
     * 
     * heng li mode: using Heng Li's gfa-plot code for drawing a canvas (credits to Heng Li)
     * @returns 
     */
    render() {
        const { options, data } = this.props;
        const { nodes } = data;
        if (!nodes) {
            return <div>Loading...</div>
        }
        if (options.displayMode === GraphDisplayModes.HENGLI) {
            return <HengGraphVisualizer {...this.props} />
        }
        if (options.displayMode === GraphDisplayModes.DENSITY) {
            return <GraphDensityMode {...this.props} />
        }
        return (
            <GraphFullMode {...this.props} />
        );
    }
}

export const GraphTrack = withDefaultOptions(withTooltip(GraphTrackNoTooltip as any));
