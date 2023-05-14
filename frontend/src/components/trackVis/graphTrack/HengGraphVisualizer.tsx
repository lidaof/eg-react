import React from 'react';
import { GraphLink } from 'model/graph/GraphLink';
import { GraphNode } from 'model/graph/GraphNode';
import Track from '../commonComponents/Track';
import TrackLegend from '../commonComponents/TrackLegend';
import TrackMessage from '../commonComponents/TrackMessage';
import TrackModel from 'model/TrackModel';
import OpenInterval from 'model/interval/OpenInterval';

interface HengGraphVisualizerProps {
    data?: any;
    width?: number;
    height?: number;
    options?: any;
    trackModel: TrackModel;
    viewWindow: OpenInterval;
}


//using Heng Li's gfa-plot library from the gfatools github repo

function toGFA(data: any) {
    const lines: string[] = [];
    const { links, nodes } = data;
    nodes.forEach((node: GraphNode) => {
        lines.push(`S\t${node.getName()}\t*\tLN:i:${node.getLength()}\tSN:Z:${node.getLocus().chr}\tSO:i:${node.getLocus().start}\tSR:i:${node.getRank()}`)
    })
    // check dups of links?
    links.forEach((link: GraphLink) => {
        lines.push(`L\t${link.source.getName()}\t${link.sourceStrand}\t${link.target.getName()}\t${link.sourceStrand}\t0M\tSR:i:${link.rank}\tL1:i:${link.source.getLocus().getLength()}\tL2:i:${link.target.getLocus().getLength()}`)
    })
    return lines.join("\n")
}

export class HengGraphVisualizer extends React.PureComponent<HengGraphVisualizerProps> {
    ref: any;
    ref2: any;
    constructor(props: HengGraphVisualizerProps) {
        super(props);
        this.ref = React.createRef();
        this.ref2 = React.createRef();
    }

    plot = () => {
        const { data } = this.props;
        const gfa = toGFA(data);
        const target = this.ref.current;
        const info = this.ref2.current;
        (window as any).gfa_plot(target, gfa, info)
    }

    componentDidMount(): void {
        this.plot()
    }

    componentDidUpdate(prevProps: Readonly<HengGraphVisualizerProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.data !== this.props.data || prevProps.viewWindow !== this.props.viewWindow) {
            this.plot()
        }
    }

    render() {
        // console.log('render')
        const { height, trackModel, data, viewWindow } = this.props;
        const { links, nodes } = data;
        const message = <TrackMessage message={`${nodes.size} nodes ${links.length} links`} />;
        return (<Track
            {...this.props}
            legend={<TrackLegend trackModel={trackModel} height={height} />}
            visualizer={<>
                <canvas width={viewWindow.getLength()} height={height} ref={this.ref} style={{ transform: `translateX(${viewWindow.start}px)` }}></canvas>
                <div ref={this.ref2}></div></>}
            message={message}
        />
        );
    }
}