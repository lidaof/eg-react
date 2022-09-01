import React from 'react';
import { GraphLink } from 'model/graph/GraphLink';
import { GraphNode } from 'model/graph/GraphNode';
import GraphNodeArranger from 'model/GraphNodeArranger';
import memoizeOne from 'memoize-one';
import DisplayedRegionModel from 'model/DisplayedRegionModel';

interface GraphVisualizerProps {
    data: any;
    width: number;
    height: number;
    options?: any;
    visRegion: DisplayedRegionModel;
}

const SVG_STYLE = {
    display: "block",
    overflow: "visible",
};



export class GraphVisualizer extends React.PureComponent<GraphVisualizerProps> {
    private nodeArranger: GraphNodeArranger;
    constructor(props: GraphVisualizerProps) {
        super(props);
        this.nodeArranger = new GraphNodeArranger();
        this.nodeArranger.arrange = memoizeOne(this.nodeArranger.arrange);
    }



    render() {
        const { data, width, height, visRegion, options } = this.props;
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
        // only rank0 is in current ref genome
        console.log(notRank0, rank0)
        const arrangedNodes = this.nodeArranger.arrange(rank0, visRegion, width,
            30, 0);
        console.log(arrangedNodes)
        return (
            <svg width={width} height={height} style={SVG_STYLE} >
                <text>aaa</text>
            </svg>
        );
    }
}