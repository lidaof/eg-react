import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { scaleLinear } from "d3-scale";
import memoizeOne from "memoize-one";
import { notify } from "react-notify-toast";
import Track from "../Track";
import TrackLegend from "../TrackLegend";
import GenomicCoordinates from "../GenomicCoordinates";
import HoverTooltipContext from "../tooltip/HoverTooltipContext";
import configOptionMerging from "../configOptionMerging";
import { RenderTypes, DesignRenderer } from "../../../../art/DesignRenderer";
import { NumericalDisplayModes } from "../../../../model/DisplayModes";
import { DefaultAggregators } from "../../../../model/FeatureAggregator";
import { ScaleChoices } from "../../../../model/ScaleChoices";
import { NumericalAggregator } from "./NumericalAggregator";
// import { withLogPropChanges } from "components/withLogPropChanges";

export const DEFAULT_OPTIONS = {
    aggregateMethod: DefaultAggregators.types.MEAN,
    displayMode: NumericalDisplayModes.AUTO,
    height: 40,
    color: "blue",
    colorAboveMax: "red",
    color2: "darkorange",
    color2BelowMin: "darkgreen",
    yScale: ScaleChoices.AUTO,
    yMax: 10,
    yMin: 0,
    smooth: 0,
    ensemblStyle: false,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

const AUTO_HEATMAP_THRESHOLD = 21; // If pixel height is less than this, automatically use heatmap
const TOP_PADDING = 2;
const THRESHOLD_HEIGHT = 3; // the bar tip height which represet value above max or below min

/**
 * Track specialized in showing numerical data.
 *
 * @author Silas Hsu
 */
class NumericalTrack extends React.PureComponent {
    /**
     * Don't forget to look at NumericalFeatureProcessor's propTypes!
     */
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        /**
         * NumericalFeatureProcessor provides these.  Parents should provide an array of NumericalFeature.
         */
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(Feature)
        unit: PropTypes.string, // Unit to display after the number in tooltips
        options: PropTypes.shape({
            aggregateMethod: PropTypes.oneOf(Object.values(DefaultAggregators.types)),
            displayMode: PropTypes.oneOf(Object.values(NumericalDisplayModes)).isRequired,
            height: PropTypes.number.isRequired, // Height of the track
            scaleType: PropTypes.any, // Unused for now
            scaleRange: PropTypes.array, // Unused for now
            color: PropTypes.string, // Color to draw bars, if using the default getBarElement
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
    });

    constructor(props) {
        super(props);
        this.xToValue = null;
        this.xToValue2 = null;
        this.scales = null;
        this.hasReverse = false;

        // this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
        this.computeScales = memoizeOne(this.computeScales);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.aggregator = new NumericalAggregator();
    }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevProps.layoutModel !== this.props.layoutModel) {
    //         console.log("layout changed");
    //         console.log(prevProps.layoutModel);
    //         console.log(this.props.layoutModel);
    //         const a = prevProps.layoutModel.toJson();
    //         const b = this.props.layoutModel.toJson();
    //         console.log(a, b);
    //         console.log(_.isEqual(a, b));
    //     }
    //     if (prevProps.groupScale !== this.props.groupScale) {
    //         console.log("groupScale changed");
    //         console.log(prevProps.groupScale);
    //         console.log(this.props.groupScale);
    //     }
    // }

    // aggregateFeatures(data, viewRegion, width, aggregatorId) {
    //     // const aggregator = new FeatureAggregator();
    //     // const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
    //     // return xToFeatures.map(DefaultAggregators.fromId(aggregatorId));
    // }

    computeScales(xToValue, xToValue2, height) {
        /*
        All tracks get `PropsFromTrackContainer` (see `Track.ts`).

        `props.viewWindow` contains the range of x that is visible when no dragging.  
            It comes directly from the `ViewExpansion` object from `RegionExpander.ts`
        */
        const { yScale, yMin, yMax } = this.props.options;
        if (yMin >= yMax) {
            notify.show("Y-axis min must less than max", "error", 2000);
        }
        const { trackModel, groupScale } = this.props;
        let gscale = {},
            min,
            max,
            xValues2 = [];
        if (groupScale) {
            if (trackModel.options.hasOwnProperty("group")) {
                gscale = groupScale[trackModel.options.group];
            }
        }
        if (!_.isEmpty(gscale)) {
            max = _.max(Object.values(gscale.max));
            min = _.min(Object.values(gscale.min));
        } else {
            const visibleValues = xToValue.slice(this.props.viewWindow.start, this.props.viewWindow.end);
            max = _.max(visibleValues) || 1; // in case undefined returned here, cause maxboth be undefined too
            xValues2 = xToValue2.filter((x) => x);
            min =
                (xValues2.length
                    ? _.min(xToValue2.slice(this.props.viewWindow.start, this.props.viewWindow.end))
                    : 0) || 0;
            const maxBoth = Math.max(Math.abs(max), Math.abs(min));
            max = maxBoth;
            min = xValues2.length ? -maxBoth : 0;
            if (yScale === ScaleChoices.FIXED) {
                max = yMax ? yMax : max;
                min = yMin !== undefined ? yMin : min;
                // if (xValues2.length && yMin > 0) {
                //     notify.show("Please set Y-axis min <=0 when there are negative values", "warning", 5000);
                //     min = 0;
                // }
            }
        }
        if (min > max) {
            notify.show("Y-axis min should less than Y-axis max", "warning", 5000);
            min = 0;
        }

        // determines the distance of y=0 from the top, also the height of positive part
        const zeroLine = min < 0 ? TOP_PADDING + ((height - 2 * TOP_PADDING) * max) / (max - min) : height;

        if (xValues2.length && (yScale === ScaleChoices.AUTO || (yScale === ScaleChoices.FIXED && yMin < 0))) {
            return {
                axisScale: scaleLinear()
                    .domain([max, min])
                    .range([TOP_PADDING, height - TOP_PADDING])
                    .clamp(true),
                valueToY: scaleLinear().domain([max, 0]).range([TOP_PADDING, zeroLine]).clamp(true),
                valueToYReverse: scaleLinear()
                    .domain([0, min])
                    .range([0, height - zeroLine - TOP_PADDING])
                    .clamp(true),
                valueToOpacity: scaleLinear().domain([0, max]).range([0, 1]).clamp(true),
                valueToOpacityReverse: scaleLinear().domain([0, min]).range([0, 1]).clamp(true),
                min,
                max,
                zeroLine,
            };
        } else {
            return {
                axisScale: scaleLinear().domain([max, min]).range([TOP_PADDING, height]).clamp(true),
                valueToY: scaleLinear().domain([max, min]).range([TOP_PADDING, height]).clamp(true),
                valueToOpacity: scaleLinear().domain([min, max]).range([0, 1]).clamp(true),
                // for group feature when there is only nagetiva data, to be fixed
                valueToYReverse: scaleLinear()
                    .domain([0, min])
                    .range([0, height - zeroLine - TOP_PADDING])
                    .clamp(true),
                valueToOpacityReverse: scaleLinear().domain([0, min]).range([0, 1]).clamp(true),
                min,
                max,
                zeroLine,
            };
        }
    }

    getEffectiveDisplayMode() {
        const { displayMode, height } = this.props.options;
        if (displayMode === NumericalDisplayModes.AUTO) {
            return height < AUTO_HEATMAP_THRESHOLD ? NumericalDisplayModes.HEATMAP : NumericalDisplayModes.BAR;
        } else {
            return displayMode;
        }
    }

    /**
     * Renders the default tooltip that is displayed on hover.
     *
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @param {number} value -
     * @return {JSX.Element} tooltip to render
     */
    renderTooltip(relativeX) {
        const { trackModel, viewRegion, width, unit } = this.props;
        const value = this.xToValue[Math.round(relativeX)];
        const value2 = this.hasReverse ? this.xToValue2[Math.round(relativeX)] : null;
        const stringValue = typeof value === "number" && !Number.isNaN(value) ? value.toFixed(2) : "(no data)";
        const stringValue2 = typeof value2 === "number" && !Number.isNaN(value2) ? value2.toFixed(2) : "(no data)";
        return (
            <div>
                <div>
                    <span className="Tooltip-major-text" style={{ marginRight: 3 }}>
                        {this.hasReverse && "Forward: "} {stringValue}
                    </span>
                    {unit && <span className="Tooltip-minor-text">{unit}</span>}
                </div>
                {this.hasReverse && (
                    <div>
                        <span className="Tooltip-major-text" style={{ marginRight: 3 }}>
                            Reverse: {stringValue2}
                        </span>
                        {unit && <span className="Tooltip-minor-text">{unit}</span>}
                    </div>
                )}
                <div className="Tooltip-minor-text">
                    <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
                </div>
                <div className="Tooltip-minor-text">{trackModel.getDisplayLabel()}</div>
            </div>
        );
    }

    render() {
        // console.log("render");
        const { data, viewRegion, width, trackModel, unit, options, forceSvg } = this.props;
        const { height, color, color2, colorAboveMax, color2BelowMin } = options;
        const xvalues = this.aggregator.xToValueMaker(data, viewRegion, width, options);
        this.xToValue = xvalues[0];
        this.xToValue2 = xvalues[1];
        this.hasReverse = xvalues[2];
        this.scales = this.computeScales(this.xToValue, this.xToValue2, height);
        const isDrawingBars = this.getEffectiveDisplayMode() === NumericalDisplayModes.BAR; // As opposed to heatmap
        const legend = (
            <TrackLegend
                trackModel={trackModel}
                height={height}
                axisScale={isDrawingBars ? this.scales.axisScale : undefined}
                // axisScale={isDrawingBars ? this.scales.valueToY : undefined}
                // axisScaleReverse={isDrawingBars ? this.scales.valueToYReverse : undefined}
                axisLegend={unit}
            />
        );
        const visualizer = this.hasReverse ? (
            <React.Fragment>
                <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip}>
                    <ValuePlot
                        xToValue={this.xToValue}
                        scales={this.scales}
                        height={this.scales.zeroLine}
                        color={color}
                        colorOut={colorAboveMax}
                        isDrawingBars={isDrawingBars}
                        forceSvg={forceSvg}
                    />
                    <hr style={{ marginTop: 0, marginBottom: 0, padding: 0 }} />
                    <ValuePlot
                        xToValue={this.xToValue2}
                        scales={this.scales}
                        height={height - this.scales.zeroLine}
                        color={color2}
                        colorOut={color2BelowMin}
                        isDrawingBars={isDrawingBars}
                        forceSvg={forceSvg}
                    />
                </HoverTooltipContext>
            </React.Fragment>
        ) : (
            <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip}>
                <ValuePlot
                    xToValue={this.xToValue}
                    scales={this.scales}
                    height={height}
                    color={color}
                    colorOut={colorAboveMax}
                    isDrawingBars={isDrawingBars}
                    forceSvg={forceSvg}
                />
            </HoverTooltipContext>
        );
        return (
            <Track
                {...this.props}
                // style={{paddingBottom: "5px"}}
                legend={legend}
                visualizer={visualizer}
            />
        );
    }
}

export class ValuePlot extends React.PureComponent {
    static propTypes = {
        xToValue: PropTypes.array.isRequired,
        scales: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        color: PropTypes.string,
        isDrawingBars: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.renderPixel = this.renderPixel.bind(this);
    }

    /**
     * Gets an element to draw for a data record.
     *
     * @param {number} value
     * @param {number} x
     * @return {JSX.Element} bar element to render
     */
    renderPixel(value, x) {
        if (!value || Number.isNaN(value)) {
            return null;
        }
        const { isDrawingBars, scales, height, color, colorOut } = this.props;
        const y = value > 0 ? scales.valueToY(value) : scales.valueToYReverse(value);
        let drawY = value > 0 ? y : 0;
        let drawHeight = value > 0 ? height - y : y;
        if (isDrawingBars) {
            // const y = scales.valueToY(value);
            // const drawHeight = height - y;
            if (drawHeight <= 0) {
                return null;
            }
            let tipY;
            if (value > scales.max || value < scales.min) {
                drawHeight -= THRESHOLD_HEIGHT;
                if (value > scales.max) {
                    tipY = y;
                    drawY += THRESHOLD_HEIGHT;
                } else {
                    tipY = drawHeight;
                }
                return (
                    <g key={x}>
                        <rect key={x} x={x} y={drawY} width={1} height={drawHeight} fill={color} />
                        <rect key={x + "tip"} x={x} y={tipY} width={1} height={THRESHOLD_HEIGHT} fill={colorOut} />
                    </g>
                );
            } else {
                return <rect key={x} x={x} y={drawY} width={1} height={drawHeight} fill={color} />;
            }
        } else {
            // Assume HEATMAP
            const opacity = value > 0 ? scales.valueToOpacity(value) : scales.valueToOpacityReverse(value);
            return <rect key={x} x={x} y={0} width={1} height={height} fill={color} fillOpacity={opacity} />;
        }
    }

    render() {
        // console.log("render in valueplot");
        const { xToValue, height, forceSvg } = this.props;
        return (
            <DesignRenderer
                type={forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS}
                width={xToValue.length}
                height={height}
            >
                {this.props.xToValue.map(this.renderPixel)}
            </DesignRenderer>
        );
    }
}

export default withDefaultOptions(NumericalTrack);
// export default withLogPropChanges(withDefaultOptions(NumericalTrack));
