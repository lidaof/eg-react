import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import memoizeOne from "memoize-one";
import Smooth from "array-smooth";
import Track from "../Track";
import TrackLegend from "../TrackLegend";
import HoverTooltipContext from "../tooltip/HoverTooltipContext";
import configOptionMerging from "../configOptionMerging";

import { RenderTypes, DesignRenderer } from "../../../../art/DesignRenderer";
import { NumericalDisplayModes } from "../../../../model/DisplayModes";
import { FeatureAggregator, DefaultAggregators } from "../../../../model/FeatureAggregator";
import { ScaleChoices } from "../../../../model/ScaleChoices";

export const DEFAULT_OPTIONS = {
    aggregateMethod: DefaultAggregators.types.MEAN,
    height: 80,
    color: "blue"
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
class DynamicNumericalTrack extends React.PureComponent {
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
            height: PropTypes.number.isRequired, // Height of the track

            color: PropTypes.string // Color to draw bars, if using the default getBarElement
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any // If present, applies error styling
    });

    constructor(props) {
        super(props);
        this.xToValue = null;

        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
    }

    aggregateFeatures(data, viewRegion, width, aggregatorId) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return xToFeatures.map(DefaultAggregators.fromId(aggregatorId));
    }

    render() {
        console.log(this.props);
        const { data, viewRegion, width, trackModel, unit, options, forceSvg } = this.props;
        const { height, color, color2, aggregateMethod, colorAboveMax, color2BelowMin, smooth } = options;
        const halfHeight = height * 0.5;
        const dataForward = data.filter(feature => feature.value === undefined || feature.value >= 0); // bed track to density mode
        const dataReverse = data.filter(feature => feature.value < 0);
        let xToValue2BeforeSmooth;
        if (dataReverse.length) {
            xToValue2BeforeSmooth = this.aggregateFeatures(dataReverse, viewRegion, width, aggregateMethod);
        } else {
            xToValue2BeforeSmooth = [];
        }
        if (options.yScale === ScaleChoices.FIXED && options.yMin !== undefined) {
            xToValue2BeforeSmooth = xToValue2BeforeSmooth.map(x => {
                if (x >= options.yMin) {
                    return x;
                }
                return undefined;
            });
        }
        this.xToValue2 = smooth === 0 ? xToValue2BeforeSmooth : Smooth(xToValue2BeforeSmooth, smooth);
        const xValues2 = this.xToValue2.filter(x => x);
        if (xValues2.length) {
            this.hasReverse = true;
        } else {
            this.hasReverse = false;
        }
        const isDrawingBars = this.getEffectiveDisplayMode() === NumericalDisplayModes.BAR; // As opposed to heatmap
        const xToValueBeforeSmooth =
            dataForward.length > 0 ? this.aggregateFeatures(dataForward, viewRegion, width, aggregateMethod) : [];
        this.xToValue = smooth === 0 ? xToValueBeforeSmooth : Smooth(xToValueBeforeSmooth, smooth);
        this.scales = this.computeScales(this.xToValue, this.xToValue2, height);
        const legend = (
            <TrackLegend
                trackModel={trackModel}
                height={height}
                axisScale={isDrawingBars ? this.scales.valueToY : undefined}
                axisScaleReverse={isDrawingBars ? this.scales.valueToYReverse : undefined}
                axisLegend={unit}
            />
        );
        const visualizer = this.hasReverse ? (
            <React.Fragment>
                <HoverTooltipContext tooltipRelativeY={halfHeight} getTooltipContents={this.renderTooltip}>
                    <ValuePlot
                        xToValue={this.xToValue}
                        scales={this.scales}
                        height={halfHeight}
                        color={color}
                        colorOut={colorAboveMax}
                        isDrawingBars={isDrawingBars}
                        forceSvg={forceSvg}
                    />
                    <hr style={{ marginTop: 0, marginBottom: 0, padding: 0 }} />
                    <ValuePlot
                        xToValue={this.xToValue2}
                        scales={this.scales}
                        height={halfHeight}
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

class ValuePlot extends React.PureComponent {
    static propTypes = {
        xToValue: PropTypes.array.isRequired,
        scales: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        color: PropTypes.string,
        isDrawingBars: PropTypes.bool
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

export default withDefaultOptions(DynamicNumericalTrack);
