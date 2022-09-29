import React from 'react';
import memoizeOne from 'memoize-one';
import { GraphLink } from 'model/graph/GraphLink';
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

interface GraphFullModeProps {
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

export class GraphFullMode extends React.PureComponent<GraphFullModeProps> {
    private nodeArranger: GraphNodeArranger;
    private nodeMap: Map<string, PlacedFeatureGroup | PlacedNode>;
    private s2t: Map<string, string[]>;
    private t2s: Map<string, string[]>;
    constructor(props: GraphFullModeProps) {
        super(props);
        this.nodeArranger = new GraphNodeArranger();
        this.nodeArranger.arrange = memoizeOne(this.nodeArranger.arrange);
        this.nodeMap = new Map();
        this.s2t = new Map(); // source to target names
        this.t2s = new Map(); // target to source names
    }

    /**
     * copied from node arranger, FIXME
     * @param groups 
     * @param padding 
     * @returns 
     */
    _assignRows = (groups: PlacedNode[], padding: number = 30): number => {
        groups.sort((a, b) => a.xSpan.start - b.xSpan.start);
        const maxXsForRows: number[] = [];
        for (const group of groups) {
            const startX = group.xSpan.start - padding;
            const endX = group.xSpan.end + padding;
            // Find the first row where the interval won't overlap with others in the row
            let row = maxXsForRows.findIndex((maxX) => maxX < startX);
            if (row === -1) {
                // Couldn't find a row -- make a new one
                maxXsForRows.push(endX);
                row = maxXsForRows.length - 1;
            } else {
                maxXsForRows[row] = endX;
            }
            group.row = row;
        }
        return maxXsForRows.length;
    }

    addRowOffset = (groups: PlacedNode[] | PlacedFeatureGroup[], offset: number) => {
        for (const group of groups) {
            group.row += offset
        }
    }

    plotNodes = (placements: PlacedFeatureGroup[] | PlacedNode[]): JSX.Element[] => {
        const { rowHeight, ySkip } = this.props.options;
        const rects: JSX.Element[] = [];
        placements.forEach((placement: PlacedFeatureGroup | PlacedNode, i: number) => {
            const [startX, endX] = placement.xSpan;
            const y = placement.row * (rowHeight + ySkip) + TOP_PADDING;
            const drawWidth = Math.max(MINIMAL_NODE_LENGTH, (endX - startX));
            rects.push(<rect key={'rect' + i} x={startX} y={y} height={rowHeight} width={drawWidth} stroke="none" onMouseMove={event => this.showNodeTooltip(event, placement.feature)} onMouseOut={this.hideTooltip} />)
            // return <polygon fill="none" stroke="black" />
        })
        return rects;
    }

    plotLinks = (links: GraphLink[]): JSX.Element[] => {
        const { rowHeight, ySkip } = this.props.options;
        const lines: JSX.Element[] = [];
        links.forEach((link, i) => {
            let x1, x2;
            const sourcePlacement = this.nodeMap.get(link.source.getName());
            const targetPlacement = this.nodeMap.get(link.target.getName());
            if (sourcePlacement && targetPlacement) {
                // some node may not exist in placement as they cannot be placed, FIXME
                const sourceWidth = Math.max(MINIMAL_NODE_LENGTH, sourcePlacement.xSpan.getLength());
                const targetWidth = Math.max(MINIMAL_NODE_LENGTH, targetPlacement.xSpan.getLength());
                const y1 = sourcePlacement.row * (rowHeight + ySkip) + TOP_PADDING + 0.5 * rowHeight;
                const y2 = targetPlacement.row * (rowHeight + ySkip) + TOP_PADDING + 0.5 * rowHeight;
                if (link.sourceStrand === '+') {
                    x1 = sourcePlacement.xSpan.start + sourceWidth;
                } else {
                    x1 = sourcePlacement.xSpan.end;
                }
                if (link.targetStrand === '+') {
                    x2 = targetPlacement.xSpan.start;
                } else {
                    x2 = targetPlacement.xSpan.start + targetWidth;
                }
                lines.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1} onMouseMove={event => this.showLinkTooltip(event, link)} onMouseOut={this.hideTooltip} />)
            }
        })
        return lines;
    }

    getHeight = (numRows: number): number => {
        const { rowHeight, ySkip } = this.props.options;
        return numRows * (rowHeight + ySkip) - ySkip + TOP_PADDING;
    }

    updateNodeMap = (placements: PlacedFeatureGroup[] | PlacedNode[]) => {
        placements.forEach((placement: PlacedFeatureGroup | PlacedNode) => this.nodeMap.set(placement.feature.getName(), placement));
    }

    updateLinks = (links: GraphLink[]) => {
        this.t2s.clear();
        this.s2t.clear();
        links.forEach(link => {
            const s = link.source.getName();
            const t = link.target.getName();
            this.s2t.set(s, !this.s2t.get(s) ? [t] : [...this.s2t.get(s), t])
            this.t2s.set(t, !this.t2s.get(t) ? [s] : [...this.t2s.get(t), s])
        })
    }

    placeNotRank0Nodes = (unplacedNodes: GraphNode[]): PlacedNode[] => {
        // for nodes not in view or cannot find genomic locatin, place them according to their linked nodes which has xSpan...
        const placements: PlacedNode[] = [];
        unplacedNodes.forEach(node => {
            const name = node.getName();
            if (this.s2t.has(name)) {
                this.s2t.get(name).forEach(linkedNode => {
                    if (this.nodeMap.has(linkedNode)) {
                        const hit = this.nodeMap.get(linkedNode);
                        const ratio = node.getLength() / hit.feature.getLength();
                        // console.log(node.getLength(), hit.feature.getLength())
                        placements.push({
                            row: -1,
                            xSpan: new OpenInterval(hit.xSpan.start, hit.xSpan.start + hit.xSpan.getLength() * ratio),
                            feature: node,
                        })
                        return;
                    }
                })
            } else if (this.t2s.has(name)) {
                this.t2s.get(name).forEach(linkedNode => {
                    if (this.nodeMap.has(linkedNode)) {
                        const hit = this.nodeMap.get(linkedNode);
                        const ratio = node.getLength() / hit.feature.getLength();
                        placements.push({
                            row: -1,
                            xSpan: new OpenInterval(hit.xSpan.start, hit.xSpan.start + hit.xSpan.getLength() * ratio),
                            feature: node,
                        })
                        return;
                    }
                })
            }
        })
        return placements;
    }

    renderFullGraph(placements0: PlacedFeatureGroup[], placements1: PlacedNode[], placements2: PlacedNode[], links: GraphLink[]) {
        // heigh0 block in middle, heigh1 in top, and heigh2 in bottom 
        const rects0 = this.plotNodes(placements0)
        const rects1 = this.plotNodes(placements1)
        const rects2 = this.plotNodes(placements2)
        const lines = this.plotLinks(links);
        return (
            <>
                <g className="type1-nodes">{rects1}</g>
                <g className="type0-nodes">{rects0}</g>
                <g className="type2-nodes">{rects2}</g>
                <g className="graph-links">{lines}</g>
            </>
        );
    }

    plotBackground = (width: number, rows1: number, color1: string, rows0: number, color0: string, rows2: number, color2: string) => {
        const { rowHeight, ySkip } = this.props.options
        const height1 = rows1 * (rowHeight + ySkip);
        const y0 = TOP_PADDING + height1, height0 = rows0 * (rowHeight + ySkip);
        const y2 = TOP_PADDING + height1 + height0, height2 = rows2 * (rowHeight + ySkip) - ySkip;
        return (
            <>
                <rect width={width} x={0} y={TOP_PADDING} height={height1} fill={color1} stroke="none" opacity={0.1} />
                <rect width={width} x={0} y={y0} height={height0} fill={color0} stroke="none" opacity={0.1} />
                <rect width={width} x={0} y={y2} height={height2} fill={color2} stroke="none" opacity={0.1} />
            </>
        );
    }

    showNodeTooltip = (event: React.MouseEvent, node: GraphNode | Feature) => {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} ignoreMouse={true}>
                <div>
                    <div>{node.getName()}</div>
                    <div>{node.getLocus().toString()}</div>
                    <div>Length: {node.getLength()}</div>
                </div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    showLinkTooltip = (event: React.MouseEvent, link: GraphLink) => {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} ignoreMouse={true} style={{ backgroundColor: "#ffcc00" }}>
                <div>
                    <div>Source: {link.source.getName()}</div>
                    <div>Target: {link.target.getName()}</div>
                    <div>Rank: {link.rank}</div>
                </div>
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    hideTooltip = () => {
        this.props.onHideTooltip();
    }

    render() {
        this.nodeMap.clear();
        const { data, trackModel, width, visRegion } = this.props;
        const { links, nodes } = data;
        // node is a Map, node name -> node object
        const notRank0: GraphNode[] = [], rank0: GraphNode[] = [];
        nodes.forEach((node: GraphNode) => {
            if (node.getRank() === 0) {
                rank0.push(node)
            } else {
                notRank0.push(node)
            }
        })
        this.updateLinks(links);
        // only rank0 is in current ref genome
        // the idea to put not rank0 nodes (also nodes out of view) to the same x position with linked nodes in rank0
        const arrangedNodes = this.nodeArranger.arrange(rank0, visRegion, width, 30, 0);
        this.updateNodeMap(arrangedNodes.placements);
        const placedNodesNotInView = this.placeNotRank0Nodes(arrangedNodes.allNodesOutOfView);
        const placedRank1Nodes = this.placeNotRank0Nodes(notRank0);
        const notInViewRows = this._assignRows(placedNodesNotInView);
        this.updateNodeMap(placedNodesNotInView)
        const rank1Rows = this._assignRows(placedRank1Nodes)
        this.updateNodeMap(placedRank1Nodes)
        const totalRows = arrangedNodes.numRowsAssigned + notInViewRows + rank1Rows;
        const height = this.getHeight(totalRows);
        this.addRowOffset(arrangedNodes.placements, notInViewRows);
        this.addRowOffset(placedRank1Nodes, notInViewRows + arrangedNodes.numRowsAssigned)
        const backRects = this.plotBackground(width, notInViewRows, '#ffcc00', arrangedNodes.numRowsAssigned, '#009900', rank1Rows, '#ff3399')
        const graph = this.renderFullGraph(arrangedNodes.placements, placedNodesNotInView, placedRank1Nodes, links);
        const visualizer = (<svg width={width} height={height} style={SVG_STYLE} >
            {backRects}
            {graph}
        </svg>)
        const message = <TrackMessage message={`${nodes.size} nodes (${arrangedNodes.placements.length} in view, ${arrangedNodes.allNodesOutOfView.length} not in view ${notRank0.length} not in genome), ${links.length} links`} />;
        return (
            <Track
                {...this.props}
                legend={<TrackLegend trackModel={trackModel} height={height} />}
                visualizer={visualizer}
                message={message}
            />
        );
    }
}