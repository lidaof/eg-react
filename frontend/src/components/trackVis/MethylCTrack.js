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
    maxRows: 1,
    height: 40,
    contextColors: MethylCRecord.DEFAULT_CONTEXT_COLORS,
    countColor: MethylCRecord.DEFAULT_COUNT_COLOR,
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
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    aggregateRecords(data, viewRegion, width) {
        const aggregator = new FeatureAggregator();
        const xToRecords = aggregator.makeXMap(data, viewRegion, width);
        window.xToRecords = xToRecords;
        return xToRecords.map(MethylCRecord.aggregateRecords);
    }

    computeScales(aggregatedRecords, height) {
        /*
        aggregatedRecords = [
            {
                depth: 5 (NaN if no data),
                contextValues: [
                    {context: "CG", value: 0.3},
                    {context: "CHH", value: 0.3},
                    {context: "Your Mom", value: 0.3},
                ]
            }
            ...
        ]
        */
        const maxDepthRecord = _.maxBy(aggregatedRecords, 'depth') || { depth: 0 };
        const maxDepth = maxDepthRecord.depth;
        return {
            methylToY: scaleLinear().domain([1, 0]).range([0, height]).clamp(true),
            readDepthToY: scaleLinear().domain([maxDepth, 0]).range([0, height]).clamp(true)
        };
    }

    /**
     * Renders the tooltip contents that appear when mousing over the track
     * 
     * @param {number} x - x coordinate of the mouseover relative to the left side of the visualizer
     * @return {JSX.Element} tooltip contents to render
     */
    renderTooltip(x) {
        const dataAtPoint = this.aggregatedRecords[x];
        if (!dataAtPoint) {
            return "(No data)";
        }
        const theContext = dataAtPoint.contextValues[0] || {};
        return (
            <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
                <li className="Tooltip-major-text">{theContext.context}</li>
                <li className="Tooltip-minor-text" >Value {theContext.value}</li>
                <li className="Tooltip-minor-text" >Depth {dataAtPoint.depth}</li>
                <li className="Tooltip-minor-text" >x={x}</li>
            </ul>
        );
    }

    renderBarElement(dataAtX, x) {
        /*
        [
            {context: "CG", value: 1, depth: 5},
            {context: "CHH", value: 0.4, depth: 10}
        ]
        */
        if (!dataAtX) {
            return null;
        }
        const height = this.props.options.height;
        let children = [<rect key={x + "bg"} x={x} y={0} width={1} height={height} fill="lightgrey" />];
        for (let data of dataAtX.contextValues) {
            const valueY = this.scales.methylToY(data.value);
            const color = MethylCRecord.DEFAULT_CONTEXT_COLORS[data.context].color;
            children.push(<rect key={x} x={x} y={valueY} width={1} height={height - valueY} fill={color} fillOpacity={0.75} />)
        }
        
        return children;
    }

    renderVisualizer() {
        const {width, options} = this.props;
        const height = options.height;
        return <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip} >
            <DesignRenderer
                type={RenderTypes.CANVAS}
                width={width}
                height={height}
            >
                {this.aggregatedRecords.map((record, x) => this.renderBarElement(record, x))}
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
