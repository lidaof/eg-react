import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { scaleLinear } from 'd3-scale';

import Track from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';
import configOptionMerging from './commonComponents/configOptionMerging';
import HoverTooltipContext from './commonComponents/tooltip/HoverTooltipContext';
import DesignRenderer, { RenderTypes } from '../../art/DesignRenderer';

import FeatureAggregator from '../../model/FeatureAggregator';
import MethylCRecord from '../../model/MethylCRecord';

import './commonComponents/tooltip/Tooltip.css';

export const DEFAULT_OPTIONS = {
    height: 40,
    isCombineStrands: false,
    contextColors: MethylCRecord.DEFAULT_CONTEXT_COLORS,
    depthColor: MethylCRecord.DEFAULT_COUNT_COLOR,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * Visualizer for MethylC tracks. 
  * 
 * @author Daofeng Li
 */
class MethylCTrack extends React.PureComponent {
    static propTypes = Object.assign({},
        Track.tracksFromTrackContainer,
        {
        data: PropTypes.array.isRequired, //PropTypes.arrayOf(PropTypes.instanceOf(MethylCRecord)).isRequired,
        }
    );

    constructor(props) {
        super(props);
        this.aggregateRecords = memoizeOne(this.aggregateRecords);
        this.computeScales = memoizeOne(this.computeScales);
        this.renderTooltipByStrand = this.renderTooltipByStrand.bind(this);
    }

    aggregateRecords(data, viewRegion, width) {
        const aggregator = new FeatureAggregator();
        const xToRecords = aggregator.makeXMap(data, viewRegion, width);
        return xToRecords.map(MethylCRecord.aggregateByStrand);
    }

    computeScales(xMap, height) {
        /*
        xMap = returnValueOfAggregateRecords = [
            {
                combined: {
                    depth: 5 (NaN if no data),
                    contextValues: [
                        {context: "CG", value: 0.3},
                        {context: "CHH", value: 0.3},
                        {context: "CHG", value: 0.3},
                    ]
                },
                forward: {},
                reverse: {}
            },
            ...
        ]
        */
        const forwardRecords = xMap.map(record => record.forward);
        const reverseRecords = xMap.map(record => record.reverse);
        const maxDepthForward = _.maxBy(forwardRecords, 'depth') || { depth: 0 };
        const maxDepthReverse = _.maxBy(reverseRecords, 'depth') || { depth: 0 };
        const maxDepth = Math.max(maxDepthForward.depth, maxDepthReverse.depth);
        return {
            methylToY: scaleLinear().domain([1, 0]).range([0, height]).clamp(true),
            readDepthToY: scaleLinear().domain([maxDepth, 0]).range([0, height]).clamp(true)
        };
    }

    renderByStrand(dataAtX, x) {
        /*
        {
            combined: {
                depth: 5 (NaN if no data),
                contextValues: [
                    {context: "CG", value: 0.3},
                    {context: "CHH", value: 0.3},
                    {context: "CHG", value: 0.3},
                ]
            },
            forward: {},
            reverse: {}
        }
        */
        if (this.props.options.isCombineStrands) {
            return this.renderBarElement(dataAtX.combined, x);
        } else {
            return [...this.renderBarElement(dataAtX.forward, x), ...this.renderBarElement(dataAtX.reverse, x, true)];
        }
    }

    renderBarElement(dataAtX, x, plotDownwards=false) {
        if (!dataAtX) {
            return [];
        }
        const options = this.props.options;
        const height = options.height;
        const backgroundY = plotDownwards ? height : 0;
        let backgroundColor = options.contextColors.CG.background;
        if (dataAtX.contextValues.length === 1) {
            const theContext = dataAtX.contextValues[0].context;
            backgroundColor = options.contextColors[theContext].background;
        }
        let children = [<rect key={x + "bg"} x={x} y={backgroundY} width={1} height={height} fill={backgroundColor} />];
        for (let data of dataAtX.contextValues) {
            const scaleY = this.scales.methylToY(data.value);
            const drawY = plotDownwards ? height : scaleY;
            const color = options.contextColors[data.context].color;
            children.push(<rect key={x + data.context} x={x} y={drawY} width={1} height={height - scaleY} fill={color} fillOpacity={0.75} />)
        }
        
        return children;
    }

    renderDepth(strand) {
        const plotDownwards = strand === "reverse";
        let children = [];
        for (let x = 0; x < this.aggregatedRecords.length - 1; x++) {
            const thisRecord = this.aggregatedRecords[x][strand];
            const nextRecord = this.aggregatedRecords[x + 1][strand];
            if (thisRecord && nextRecord) {
                const scaleY1 = this.scales.readDepthToY(thisRecord.depth);
                const scaleY2 = this.scales.readDepthToY(nextRecord.depth);
                const y1 = plotDownwards ? this.props.options.height * 2 - scaleY1 : scaleY1;
                const y2 = plotDownwards ? this.props.options.height * 2 - scaleY2 : scaleY2;
                children.push(<line key={x} x1={x} y1={y1} x2={x+1} y2={y2} stroke="black" />);
            }
        }
        return children;
    }

    renderTooltipByStrand(x) {
        const dataAtPoint = this.aggregatedRecords[x];
        if (this.props.options.isCombineStrands) {
            return this.renderTooltip(dataAtPoint.combined);
        } else {
            return <div>
                <h4>Forward</h4>
                {this.renderTooltip(dataAtPoint.forward)}
                <h4>Reverse</h4>
                {this.renderTooltip(dataAtPoint.reverse)}
            </div>
        }
    }

    /**
     * Renders the tooltip contents that appear when mousing over the track
     * 
     * @param {number} x - x coordinate of the mouseover relative to the left side of the visualizer
     * @return {JSX.Element} tooltip contents to render
     */
    renderTooltip(dataAtPoint) {
        if (!dataAtPoint) {
            return "(No data)";
        }
        return (
            <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
                <li className="Tooltip-minor-text" >Depth {dataAtPoint.depth}</li>
                {dataAtPoint.contextValues.map(data => (
                    <React.Fragment key={data.context}>
                        <li className="Tooltip-major-text">{data.context}</li>
                        <li className="Tooltip-minor-text" >Value {data.value}</li>
                    </React.Fragment>
                ))}
            </ul>
        );
    }

    renderVisualizer() {
        const {width, options} = this.props;
        const height = options.height;
        const canvasHeight = options.isCombineStrands ? height : height * 2
        return <HoverTooltipContext tooltipRelativeY={canvasHeight} getTooltipContents={this.renderTooltipByStrand} >
            <DesignRenderer
                type={RenderTypes.CANVAS}
                width={width}
                height={canvasHeight}
            >
                {this.aggregatedRecords.map((record, x) => this.renderByStrand(record, x))}
                {this.props.options.isCombineStrands ? this.renderDepth("combined") : this.renderDepth("forward") }
                {this.props.options.isCombineStrands ? null : this.renderDepth("reverse") }
            </DesignRenderer>
        </HoverTooltipContext>
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {data, viewRegion, width, options} = this.props;
        this.aggregatedRecords = this.aggregateRecords(data, viewRegion, width);
        this.scales = this.computeScales(this.aggregatedRecords, options.height);
        return <Track
            {...this.props}
            legend={<TrackLegend trackModel={this.props.trackModel} height={this.props.options.height} scaleForAxis={this.scales.methylToY} />}
            visualizer={this.renderVisualizer()}
        />
    }
}

export default withDefaultOptions(MethylCTrack);
