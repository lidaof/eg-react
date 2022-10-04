import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import TrackModel from "model/TrackModel";
import DisplayedRegionModel from "model/DisplayedRegionModel";
import TabixSource from "dataSources/bed/TabixSource";
import ChromosomeInterval from "model/interval/ChromosomeInterval";

interface GraphContainerProps {
    width: number;
    height: number;
    ggtrack: TrackModel;
    viewRegion: DisplayedRegionModel;
}

interface GraphContainerState {
    data: any;
}


class GraphContainer extends React.PureComponent<GraphContainerProps, GraphContainerState> {
    static propTypes = {
        // tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired, // g3d Tracks to render
        ggtrack: PropTypes.instanceOf(TrackModel).isRequired,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    };

    ref: any;
    chromHash: object;
    constructor(props: any) {
        super(props);
        this.ref = React.createRef();
        this.chromHash = {}; // key: chrom, value: length
        this.state = {
            data: null,
        }
    }

    async componentDidMount(): Promise<void> {
        const { viewRegion } = this.props;
        const features = viewRegion.getNavigationContext().getFeatures();
        features.forEach((feature) => (this.chromHash[feature.name] = feature.locus.end));
        await this.prepareData()
        // this.prepareSvg()
    }

    async componentDidUpdate(prevProps: Readonly<GraphContainerProps>, prevState: Readonly<GraphContainerState>, snapshot?: any): Promise<void> {
        const { data } = this.state;
        if (prevProps.viewRegion !== this.props.viewRegion) {
            await this.prepareData()
        }
        if (prevState.data !== data) {
            this.prepareSvg()
        }
    }

    prepareData = async () => {
        const { ggtrack, viewRegion } = this.props;
        const region0 = viewRegion.getFeatureSegments()[0]; // use first chrom here, FIXME
        console.log('fetching data');
        const dataSource = new TabixSource(ggtrack.url, ggtrack.url + '.tbi');
        const records = await dataSource.getData([new ChromosomeInterval(region0.getName(), region0.relativeStart, region0.relativeEnd)]);
        // const records = await dataSource.getData([new ChromosomeInterval('chr7', 25763189, 27044648)]);
        const nodes = new Map();
        const links: any = [];
        records.forEach(record => {
            nodes.set(record[3], { id: record[3], chr: record.chr, start: record.start, end: record.end, rank: 0 })
            const json = JSON.parse(record[4]);
            json.forEach((j: any) => {
                if (j.hasOwnProperty('s')) {
                    links.push({ source: j['s'].name, target: record[3], rank: j['s'].rank })
                    if (!nodes.has(j['s'].name)) {
                        nodes.set(j['s'].name, { id: j['s'].name, chr: j['s'].sname, start: j['s'].soff, end: j['s'].soff + j['s'].len, rank: j['s'].rank })
                    }
                } else if (j.hasOwnProperty('t')) {
                    links.push({ source: record[3], target: j['t'].name, rank: j['t'].rank })
                    if (!nodes.has(j['t'].name)) {
                        nodes.set(j['t'].name, { id: j['t'].name, chr: j['t'].sname, start: j['t'].soff, end: j['t'].soff + j['t'].len, rank: j['t'].rank })
                    }
                }
            })
        })
        const data = ({ nodes: Array.from(nodes.values()), links })
        this.setState({ data })

    }

    prepareSvg = () => {
        // from https://observablehq.com/@d3/mobile-patent-suits?collection=@d3/d3-force
        const host = this.ref.current;
        if (host.firstElementChild) {
            host.removeChild(host.firstElementChild);
        }
        const { width, height } = this.props;
        const { data } = this.state;
        if (!data) return;
        const links = data.links.map((d: any) => Object.create(d));
        const nodes = data.nodes.map((d: any) => Object.create(d));
        const ranks: number[] = Array.from(new Set(links.map((d: any) => d.rank)))
        const color = d3.scaleSequential().domain(d3.extent(ranks))
            .interpolator(d3.interpolateViridis)
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => (d as any).id))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        const svg = d3.create("svg")
            .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
            .style("font", "12px sans-serif");

        // Per-type markers, as they don't inherit styles.
        svg.append("defs").selectAll("marker")
            .data(ranks)
            .join("marker")
            .attr("id", d => `arrow-${d}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -0.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", color)
            .attr("d", "M0,-5L10,0L0,5");

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("stroke", d => color((d as any).rank))
            .attr("marker-end", (d: any) => `url(${`#arrow-${d.rank}`})`);

        const node = svg.append("g")
            .attr("fill", "currentColor")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(this.drag(simulation));

        node.append("circle")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("r", 4);

        node.append("text")
            .attr("x", 8)
            .attr("y", "0.31em")
            .text(d => (d as any).id)
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3);

        simulation.on("tick", () => {
            link.attr("d", this.linkArc);
            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });
        host.appendChild(svg.node())
    }

    linkArc = (d: any) => {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
    }

    drag = (simulation: any) => {

        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended) as any;
    }

    render() {
        console.log(this.props)
        return <div ref={this.ref}></div>;
    }
}

export default GraphContainer;
