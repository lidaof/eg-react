import React from 'react';
import { GraphLink } from 'model/graph/GraphLink';
import { GraphNode } from 'model/graph/GraphNode';
import GraphNodeArranger, { GraphNodeArrangementResult } from 'model/GraphNodeArranger';
import memoizeOne from 'memoize-one';
import DisplayedRegionModel from 'model/DisplayedRegionModel';
import { PlacedFeatureGroup } from 'model/FeatureArranger';
import TrackLegend from '../commonComponents/TrackLegend';
import TrackMessage, { HiddenItemsMessage } from '../commonComponents/TrackMessage';
import Track from '../commonComponents/Track';
import TrackModel from 'model/TrackModel';

interface GraphFullModeProps {
    data: any;
    width: number;
    visRegion: DisplayedRegionModel;
    options: any;
    trackModel: TrackModel,
}

const SVG_STYLE = {
    display: "block",
    overflow: "visible",
};

const TOP_PADDING = 2;
const MINIMAL_NODE_LENGTH = 4;

export class GraphFullMode extends React.PureComponent<GraphFullModeProps> {
    private nodeArranger: GraphNodeArranger;
    private nodeMap: Map<string, PlacedFeatureGroup>;
    constructor(props: GraphFullModeProps) {
        super(props);
        this.nodeArranger = new GraphNodeArranger();
        this.nodeArranger.arrange = memoizeOne(this.nodeArranger.arrange);
        this.nodeMap = new Map();
    }


    plotRank0Nodes = (placements: PlacedFeatureGroup[]): JSX.Element[] => {
        const { rowHeight, ySkip } = this.props.options;
        const rects: JSX.Element[] = [];
        placements.forEach((placement, i) => {
            const [startX, endX] = placement.xSpan;
            const y = placement.row * (rowHeight+ySkip) + TOP_PADDING;
            const drawWidth = Math.max(MINIMAL_NODE_LENGTH, (endX - startX));
            rects.push(<rect key={'rect' + i} x={startX} y={y} height={rowHeight} width={drawWidth} fill="blue" stroke="black" />)
            // return <polygon fill="none" stroke="black" />

        })
        return rects;
    }

    plotRank0Links = (links: GraphLink[]):JSX.Element[] => {
        const { rowHeight, ySkip } = this.props.options;
        const lines: JSX.Element[] = [];
        links.forEach((link,i) => {
            let x1, x2;
            const sourcePlacement = this.nodeMap.get(link.source.getName());
            const targetPlacement = this.nodeMap.get(link.target.getName());
            if(sourcePlacement && targetPlacement) {
                // some node may not exist in placement as they cannot be placed, FIXME
            const sourceWidth = Math.max(MINIMAL_NODE_LENGTH, sourcePlacement.xSpan.getLength());
            const targetWidth = Math.max(MINIMAL_NODE_LENGTH, targetPlacement.xSpan.getLength());

                const y1 = sourcePlacement.row * (rowHeight+ySkip) + TOP_PADDING + 0.5*rowHeight;
                const y2 = targetPlacement.row * (rowHeight+ySkip) + TOP_PADDING + 0.5*rowHeight;
                if (link.rank === 0) {
                    if (link.sourceStrand === '+') {
                        x1 = sourcePlacement.xSpan.start+sourceWidth;
                    } else {
                        x1 = sourcePlacement.xSpan.end;
                    }
                    if(link.targetStrand === '+') {
                        x2 = targetPlacement.xSpan.start;
                    } else {
                        x2 = targetPlacement.xSpan.start + targetWidth;
                    }
                    lines.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={1} />)
                }
            }
        })
        return lines;
    }

    getHeight = (numRows: number): number => {
        const { rowHeight, ySkip } = this.props.options;
        return numRows * (rowHeight+ySkip) + TOP_PADDING;
    }

    updateNodeMap = (placements: PlacedFeatureGroup[]) => {
        this.nodeMap.clear();
        placements.forEach(placement => this.nodeMap.set(placement.feature.getName(), placement));
    }

    renderFullGraph(arrangedNodes:GraphNodeArrangementResult, nodes: GraphNode[], links: GraphLink[], width: number, height:number) {
        const notRank0: GraphNode[] = [], rank0: GraphNode[] = [];
        nodes.forEach((node: GraphNode) => {
            if (node.getRank() === 0) {
                rank0.push(node)
            } else {
                notRank0.push(node)
            }
        })
        const rank0Svg = this.plotRank0Nodes(arrangedNodes.placements)
        this.updateNodeMap(arrangedNodes.placements)
        const link0Svg = this.plotRank0Links(links);
        return (
            <svg width={width} height={height} style={SVG_STYLE} >
                {rank0Svg}
                {link0Svg}
            </svg>
        );
    }

    render() {
        const { data, trackModel, width, visRegion } = this.props;
        const { links, nodes } = data;
        // node is a Map, node name -> node object
        const notRank0: GraphNode[] = [], rank0: GraphNode[] = [];
        if(!nodes) {
            return <div>Loading...</div>
        }
        nodes.forEach((node: GraphNode) => {
            if (node.getRank() === 0) {
                rank0.push(node)
            } else {
                notRank0.push(node)
            }
        })
        // only rank0 is in current ref genome
        console.log(nodes)
        const arrangedNodes = this.nodeArranger.arrange(rank0, visRegion, width,
            30, 0);
        console.log(arrangedNodes)
        const height = this.getHeight(arrangedNodes.numRowsAssigned);
        const visualizer = this.renderFullGraph(arrangedNodes, nodes, links, width, height)
        const message = <TrackMessage message={`${nodes.size} nodes, ${links.length} links`} />;
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