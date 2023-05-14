import React from 'react';
import memoizeOne from 'memoize-one';
import { ScaleLinear, scaleLinear } from "d3-scale";
import _ from "lodash";
import { GraphNode } from 'model/graph/GraphNode';
import GraphNodeArranger from 'model/GraphNodeArranger';
import DisplayedRegionModel from 'model/DisplayedRegionModel';
import { PlacedFeatureGroup } from 'model/FeatureArranger';
import TrackLegend from '../commonComponents/TrackLegend';
import TrackMessage from '../commonComponents/TrackMessage';
import Track from '../commonComponents/Track';
import TrackModel from 'model/TrackModel';
import OpenInterval from 'model/interval/OpenInterval';
import Tooltip from '../commonComponents/tooltip/Tooltip';
import Feature from 'model/Feature';

import "./GraphTrack.css"

interface GraphDensityModeProps {
    data: any;
    width: number;
    visRegion: DisplayedRegionModel;
    options: any;
    trackModel: TrackModel;
    onShowTooltip(tooltip: any): void;
    onHideTooltip(): void;
}

export interface PlacedNode {
    feature: GraphNode;
    row: number;
    xSpan: OpenInterval;
}

const SVG_STYLE = {
    display: "block",
    overflow: "visible",
};

const TOP_PADDING = 2;
const MINIMAL_NODE_LENGTH = 4;
const colors = ["#4a7bcb", "#80aaff", "#48cba4", "#80ffd5"];

export class GraphDensityMode extends React.PureComponent<GraphDensityModeProps> {
    private nodeArranger: GraphNodeArranger;
    constructor(props: GraphDensityModeProps) {
        super(props);
        this.nodeArranger = new GraphNodeArranger();
        this.nodeArranger.arrange = memoizeOne(this.nodeArranger.arrange);
        this.computeScales = memoizeOne(this.computeScales);
    }

    computeScales = (linkCounts: Map<string, number[]>) => {
        const { height } = this.props.options;
        const totals: number[] = [];
        linkCounts.forEach((counts) => {
            totals.push(_.sum(counts))
        })
        return {
            drawScale: scaleLinear().domain([0, _.max(totals)]).range([0, height - TOP_PADDING]).clamp(true),
            axisScale: scaleLinear().domain([_.max(totals), 0]).range([TOP_PADDING, height - TOP_PADDING]).clamp(true),
        };
    }

    plotStackBar = (placements: PlacedFeatureGroup[] | PlacedNode[], linkCounts: Map<string, number[]>, scales: ScaleLinear<number, number>): JSX.Element[] => {
        const { height } = this.props.options;
        const gs: JSX.Element[] = [];
        placements.forEach((placement: PlacedFeatureGroup | PlacedNode, i: number) => {
            const [startX, endX] = placement.xSpan;
            const drawWidth = Math.max(MINIMAL_NODE_LENGTH, (endX - startX));
            const counts = linkCounts.get(placement.feature.getName());
            const rects: JSX.Element[] = [];
            let startY = height - TOP_PADDING;
            counts.forEach((count: number, j: number) => {
                if (count > 0) {
                    const drawHeight = scales(count);
                    startY -= drawHeight;
                    rects.push(
                        <rect key={'bar' + j} x={startX} y={startY} height={drawHeight} width={drawWidth} stroke="none" fill={colors[j]} />
                    )
                }
            })
            gs.push(<g key={"bargroup" + i} onMouseMove={event => this.showTooltip(event, placement.feature, counts)} onMouseOut={this.hideTooltip}>{rects}</g>)
            // return <polygon fill="none" stroke="black" />
        })
        return gs;
    }

    showTooltip = (event: React.MouseEvent, node: GraphNode | Feature, counts: number[]) => {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} ignoreMouse={true}>
                <div>
                    <div>{node.getName()}</div>
                    <div>{node.getLocus().toString()}</div>
                    <div>Length: {node.getLength()}</div>
                    <div>Links to others: {counts[0]} / {counts[1]} in/not in genome</div>
                    <div>Linked by other: {counts[2]} / {counts[3]} in/not in genome</div>
                </div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }


    hideTooltip = () => {
        this.props.onHideTooltip();
    }

    render() {
        const { data, trackModel, width, visRegion, options } = this.props;
        const { links, nodes, linkCounts } = data;
        // node is a Map, node name -> node object
        const notRank0: GraphNode[] = [], rank0: GraphNode[] = [];
        nodes.forEach((node: GraphNode) => {
            if (node.getRank() === 0) {
                rank0.push(node)
            } else {
                notRank0.push(node)
            }
        })
        // only rank0 is in current ref genome
        // the idea to put not rank0 nodes (also nodes out of view) to the same x position with linked nodes in rank0
        // in density mode we draw things based on link counts for each rank0 node
        const arrangedNodes = this.nodeArranger.arrange(rank0, visRegion, width, 0, 0);
        const scales = this.computeScales(linkCounts);
        const gs = this.plotStackBar(arrangedNodes.placements, linkCounts, scales.drawScale)
        const visualizer = (<svg width={width} height={options.height} style={SVG_STYLE} >
            {gs}
        </svg>)
        const message = <TrackMessage message={`${nodes.size} nodes (${arrangedNodes.placements.length} in view, ${arrangedNodes.allNodesOutOfView.length} not in view ${notRank0.length} not in genome), ${links.length} links`} />;
        return (
            <Track
                {...this.props}
                legend={<TrackLegend trackModel={trackModel} height={options.height} axisScale={scales.axisScale} />}
                visualizer={visualizer}
                message={message}
            />
        );
    }
}