import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { scaleLinear } from 'd3-scale';

import Track from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';
import configOptionMerging from './commonComponents/configOptionMerging';
import HoverTooltipContext from './commonComponents/tooltip/HoverTooltipContext';
import GenomicCoordinates from './commonComponents/GenomicCoordinates';
import DesignRenderer, { RenderTypes } from '../../art/DesignRenderer';

import TrackModel from '../../model/TrackModel';
import { FeatureAggregator } from '../../model/FeatureAggregator';
import MethylCRecord from '../../model/MethylCRecord';
import { getContrastingColor } from '../../util';

import './commonComponents/tooltip/Tooltip.css';
import './MethylCTrack.css';

const VERTICAL_PADDING = 3;
const PLOT_DOWNWARDS_STRAND = "reverse";
const DEFAULT_COLORS_FOR_CONTEXT = {
    CG: { color: "rgb(100,139,216)", background: "#d9d9d9" },
    CHG: { color: "rgb(255,148,77)", background: "#ffe0cc" },
    CHH: { color: "rgb(255,0,255)", background: "#ffe5ff" },
};
const OVERLAPPING_CONTEXTS_COLORS = DEFAULT_COLORS_FOR_CONTEXT.CG;
const UNKNOWN_CONTEXT_COLORS = DEFAULT_COLORS_FOR_CONTEXT.CG;

export const DEFAULT_OPTIONS = {
    height: 40,
    isCombineStrands: false,
    colorsForContext: DEFAULT_COLORS_FOR_CONTEXT,
    depthColor: "#525252",
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

function makeBackgroundColorStyle(color) {
    return {
        color: getContrastingColor(color),
        backgroundColor: color,
        padding: "0px 3px", // 3px horizontal padding
        borderRadius: 3,
    };
}

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
        this.renderTooltipContents = this.renderTooltipContents.bind(this);
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
            methylToY: scaleLinear().domain([1, 0]).range([VERTICAL_PADDING, height]).clamp(true),
            depthToY: scaleLinear().domain([maxDepth, 0]).range([VERTICAL_PADDING, height]).clamp(true)
        };
    }

    /**
     * Renders the tooltip contents that appear when mousing over the track
     * 
     * @param {number} x - x coordinate of the mouseover relative to the left side of the visualizer
     * @return {JSX.Element} tooltip contents to render
     */
    renderTooltipContents(x) {
        const {trackModel, viewRegion, width, options} = this.props;
        const strandsAtPixel = this.aggregatedRecords[Math.round(x)];

        return <div>
            {this.renderTooltipContentsForStrand(strandsAtPixel, options.isCombineStrands ? "combined" : "forward")}
            {!options.isCombineStrands && this.renderTooltipContentsForStrand(strandsAtPixel, "reverse")}
            <div className="Tooltip-minor-text">
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={x} />
            </div>
            <div className="Tooltip-minor-text" >{trackModel.getDisplayLabel()}</div>
        </div>;
    }

    renderTooltipContentsForStrand(strandsAtPixel, strand) {
        const {depthColor, colorsForContext} = this.props.options;
        const dataAtPixel = strandsAtPixel[strand];
        let details = null;
        if (dataAtPixel) {
            let dataElements = [];
            // Sort alphabetically by context name first
            const contextValues = _.sortBy(dataAtPixel.contextValues, 'context');
            for (let contextData of contextValues) {
                const contextName = contextData.context;
                const color = (colorsForContext[contextName] || UNKNOWN_CONTEXT_COLORS).color;
                dataElements.push(
                    <div key={contextName + "label"} style={makeBackgroundColorStyle(color)} >{contextName}</div>,
                    <div key={contextName + "value"} >{contextData.value.toFixed(2)}</div>
                );
            }
            details = (
                <div className="MethylCTrack-tooltip-strand-details" >
                    <div style={makeBackgroundColorStyle(depthColor)}>Depth</div>
                    <div>{Math.round(dataAtPixel.depth)}</div>
                    {dataElements}
                </div>
            );
        }

        return <div key={strand} className="MethylCTrack-tooltip-strand">
            <span className="MethylCTrack-tooltip-strand-title">{strand}</span>
            {details || <div className="Tooltip-minor-text">(No data)</div>}
        </div>;
    }

    renderVisualizer() {
        const {width, options} = this.props;
        const {height, colorsForContext, depthColor, isCombineStrands} = options;
        const childProps = {
            data: this.aggregatedRecords, scales: this.scales, htmlType: RenderTypes.CANVAS,
            width, height, colorsForContext, depthColor
        };
        let strandRenderers, tooltipY;
        if (isCombineStrands) {
            strandRenderers = <StrandVisualizer {...childProps} strand="combined" />;
            tooltipY = height;
        } else {
            strandRenderers = <React.Fragment>
                <StrandVisualizer {...childProps} strand="forward" />
                <StrandVisualizer {...childProps} strand="reverse" />
            </React.Fragment>;
            tooltipY = height * 2;
        }

        return (
        <HoverTooltipContext tooltipRelativeY={tooltipY} getTooltipContents={this.renderTooltipContents} >
            {strandRenderers}
        </HoverTooltipContext>
        );
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {data, trackModel, viewRegion, width, options} = this.props;
        this.aggregatedRecords = this.aggregateRecords(data, viewRegion, width);
        this.scales = this.computeScales(this.aggregatedRecords, options.height);
        return <Track
            {...this.props}
            legend={
                <div>
                    <TrackLegend trackModel={trackModel} height={options.height} axisScale={this.scales.methylToY} />
                    {!options.isCombineStrands && <ReverseStrandLegend trackModel={trackModel} height={options.height} />}
                </div>
            }
            visualizer={this.renderVisualizer()}
        />
    }
}

export default withDefaultOptions(MethylCTrack);

class StrandVisualizer extends React.PureComponent {
    static propTypes = {
        data: PropTypes.array.isRequired,
        strand: PropTypes.string.isRequired,
        scales: PropTypes.object.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        colorsForContext: PropTypes.object.isRequired,
        depthColor: PropTypes.string.isRequired,
        htmlType: PropTypes.any,
    };

    getColorsForContext(contextName) {
        return this.props.colorsForContext[contextName] || UNKNOWN_CONTEXT_COLORS;
    }

    renderBarElement(x) {
        const {data, scales, strand, height} = this.props;
        const pixelData = data[x][strand];
        if (!pixelData) {
            return null;
        }

        
        let backgroundColor;
        if (pixelData.contextValues.length === 1) {
            const contextName = pixelData.contextValues[0].context;
            backgroundColor = this.getColorsForContext(contextName).background;
        } else {
            backgroundColor = OVERLAPPING_CONTEXTS_COLORS.background
        }

        let elements = [
            <rect key={x + "bg"} x={x} y={VERTICAL_PADDING} width={1} height={height} fill={backgroundColor} />
        ];
        for (let contextData of pixelData.contextValues) {
            const contextName = contextData.context;
            const drawY = scales.methylToY(contextData.value);
            const drawHeight = height - drawY;
            const color = this.getColorsForContext(contextName).color;
            elements.push(<rect
                key={x + contextName}
                x={x}
                y={drawY}
                width={1}
                height={drawHeight}
                fill={color}
                fillOpacity={0.75}
            />);
        }
        
        return elements;
    }

    renderDepthPlot() {
        const {data, scales, strand, depthColor} = this.props;
        let elements = [];
        for (let x = 0; x < data.length - 1; x++) {
            const currentRecord = data[x][strand];
            const nextRecord = data[x + 1][strand];
            if (currentRecord && nextRecord) {
                const y1 = scales.depthToY(currentRecord.depth);
                const y2 = scales.depthToY(nextRecord.depth);
                elements.push(<line key={x} x1={x} y1={y1} x2={x + 1} y2={y2} stroke={depthColor} />);
            }
        }
        return elements;
    }

    render() {
        const {data, strand, width, height, htmlType} = this.props;
        const style = strand === PLOT_DOWNWARDS_STRAND ?
            {transform: "scale(1, -1)", borderBottom: "1px solid lightgrey"} : undefined;
        let bars = [];
        for (let x = 0; x < data.length; x++) {
            bars.push(this.renderBarElement(x))
        }
        return (
        <DesignRenderer
            type={htmlType}
            width={width}
            height={height}
            style={style}
        >
            {bars}
            {this.renderDepthPlot()}
        </DesignRenderer>
        );
    }
}

function ReverseStrandLegend(props) {
    const mockTrackModel = new TrackModel({name: "Reverse strand", isSelected: props.trackModel.isSelected});
    return <TrackLegend
        trackModel={mockTrackModel}
        height={props.height}
        axisScale={scaleLinear().domain([0, 1]).range([0, props.height - VERTICAL_PADDING])}
    />;
}
