import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { scaleLinear } from "d3-scale";
import memoizeOne from "memoize-one";
import { notify } from "react-notify-toast";
import HoverTooltipContext from "../commonComponents/tooltip/HoverTooltipContext";
import Chromosomes from "components/genomeNavigator/Chromosomes";
import withCurrentGenome from "components/withCurrentGenome";
import { DefaultAggregators, FeatureAggregator } from "model/FeatureAggregator";
import Track from "../commonComponents/Track";
import GenomicCoordinates from "../commonComponents/GenomicCoordinates";
import configOptionMerging from "../commonComponents/configOptionMerging";
import { ScaleChoices } from "model/ScaleChoices";
import { getGenomeConfig } from "model/genomes/allGenomes";
import TrackLegend from "../commonComponents/TrackLegend";
import NumericalTrack from "../commonComponents/numerical/NumericalTrack";

const CHROMOSOMES_Y = 60;
const TOP_PADDING = 2;
export const MAX_PIXELS_PER_BASE_NUMERIC = 0.5;

export const DEFAULT_OPTIONS = {
    aggregateMethod: DefaultAggregators.types.MEAN,
    height: 40,
    color: "blue",
    color2: "darkorange",
    yScale: ScaleChoices.AUTO,
    yMax: 0.25,
    yMin: -0.25,
};

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

class DynseqTrack extends PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(Feature)
        unit: PropTypes.string, // Unit to display after the number in tooltips
        options: PropTypes.shape({
            aggregateMethod: PropTypes.oneOf(Object.values(DefaultAggregators.types)),
            height: PropTypes.number.isRequired, // Height of the track
            color: PropTypes.string, // Color to draw bars, if using the default getBarElement
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
    });

    constructor(props) {
        super(props);
        this.xToValue = null;
        this.xToValue2 = null;
        this.allValues = [];
        this.drawHeights = [];
        this.scales = null;
        this.hasReverse = false;
        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
        this.computeScales = memoizeOne(this.computeScales);
    }

    aggregateFeatures(data, viewRegion, width, aggregatorId) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return xToFeatures.map(DefaultAggregators.fromId(aggregatorId));
    }

    computeScales(xToValue, xToValue2, height) {
        const { yScale, yMin, yMax } = this.props.options;
        if (yMin > yMax) {
            notify.show("Y-axis min must less than max", "error", 2000);
        }

        if (yMin > 0) {
            notify.show("Y-axis min > 0 not supported", "error", 2000);
        }
        /*
        All tracks get `PropsFromTrackContainer` (see `Track.ts`).

        `props.viewWindow` contains the range of x that is visible when no dragging.  
            It comes directly from the `ViewExpansion` object from `RegionExpander.ts`
        */
        const visibleValues = xToValue.slice(this.props.viewWindow.start, this.props.viewWindow.end);
        let max = _.max(visibleValues) || 0; // in case undefined returned here, cause maxboth be undefined too
        let min =
            (xToValue2.length > 0
                ? _.min(xToValue2.slice(this.props.viewWindow.start, this.props.viewWindow.end))
                : 0) || 0;

        // const maxBoth = Math.max(Math.abs(max), Math.abs(min));
        // max = maxBoth;
        // min = xToValue2.length > 0 ? -maxBoth : 0;

        if (yScale === ScaleChoices.FIXED) {
            max = yMax ? yMax : max;
            min = yMin ? yMin : min;
        }
        if (min > max) {
            notify.show("Y-axis min should less than Y-axis max", "warning", 5000);
            min = 0;
        }

        // determines the distance of y=0 from the top
        const zeroLine = min < 0 ? TOP_PADDING + ((height - 2 * TOP_PADDING) * max) / (max - min) : height;

        if (xToValue2.length > 0) {
            return {
                valueToHeight: scaleLinear()
                    .domain([min, max])
                    .range([zeroLine - height + TOP_PADDING, zeroLine - TOP_PADDING]),
                valueToY: scaleLinear().domain([max, 0]).range([TOP_PADDING, zeroLine]).clamp(true),
                axisScale: scaleLinear()
                    .domain([max, min])
                    .range([TOP_PADDING, height - TOP_PADDING])
                    .clamp(true),
                valueToYReverse: scaleLinear()
                    .domain([0, min])
                    .range([0, zeroLine - TOP_PADDING])
                    .clamp(true),
                valueToOpacity: scaleLinear().domain([0, max]).range([0, 1]).clamp(true),
                valueToOpacityReverse: scaleLinear().domain([0, min]).range([0, 1]).clamp(true),
                min,
                max,
                zeroLine,
            };
        } else {
            return {
                valueToHeight: scaleLinear()
                    .domain([min, max])
                    .range([0, height - TOP_PADDING]),
                valueToY: scaleLinear().domain([max, min]).range([TOP_PADDING, height]).clamp(true),
                axisScale: scaleLinear().domain([max, min]).range([TOP_PADDING, height]).clamp(true),
                valueToOpacity: scaleLinear().domain([min, max]).range([0, 1]).clamp(true),
                min,
                max,
                zeroLine,
            };
        }
    }

    /**
     * Renders the default tooltip that is displayed on hover.
     *
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @param {number} value -
     * @return {JSX.Element} tooltip to render
     */
    renderTooltip = (relativeX) => {
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
    };

    render() {
        const { data, viewRegion, width, trackModel, options, unit } = this.props;
        const { height, aggregateMethod } = options;
        const dataForward = data.filter((feature) => feature.value === undefined || feature.value >= 0); // bed track to density mode
        const dataReverse = data.filter((feature) => feature.value < 0);
        if (dataReverse.length > 0) {
            this.hasReverse = true;
            this.xToValue2 = this.aggregateFeatures(dataReverse, viewRegion, width, aggregateMethod);
        } else {
            this.xToValue2 = [];
        }
        this.xToValue =
            dataForward.length > 0 ? this.aggregateFeatures(dataForward, viewRegion, width, aggregateMethod) : [];
        this.scales = this.computeScales(this.xToValue, this.xToValue2, height);
        this.drawHeights = this.xToValue.map((x) => this.scales.valueToHeight(x) || 0);
        this.allValues = this.xToValue.map((x) => x || 0);
        if (this.xToValue2.length > 0) {
            const negHeights = this.xToValue2.map((x) => this.scales.valueToHeight(x) || 0);
            this.drawHeights = this.drawHeights.map((num, idx) => num + negHeights[idx]);
            this.allValues = this.allValues.map((num, idx) => num + (this.xToValue2[idx] || 0));
        }
        // const drawModel = new LinearDrawingModel(viewRegion, width);
        // const seqmode = drawModel.basesToXWidth(1) > 2;
        const genomeConfig = getGenomeConfig(trackModel.getMetadata("genome")) || this.props.genomeConfig;
        // why not use `basesPerPixel` as in screenshot this value will change as we removed expanded region
        const basesByPixel = viewRegion.getWidth() / width;
        if (basesByPixel <= MAX_PIXELS_PER_BASE_NUMERIC) {
            const legend = (
                <TrackLegend
                    trackModel={trackModel}
                    height={height}
                    axisScale={this.scales.axisScale}
                    axisLegend={unit}
                />
            );
            const visualizer = (
                <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip}>
                    <svg width={width} height={height} style={{ display: "block" }}>
                        <Chromosomes
                            genomeConfig={genomeConfig}
                            viewRegion={viewRegion}
                            width={width}
                            labelOffset={CHROMOSOMES_Y}
                            hideChromName={true}
                            drawHeights={this.drawHeights}
                            zeroLine={this.scales.zeroLine}
                            height={height}
                            hideCytoband={true}
                            minXwidthPerBase={2}
                        />
                    </svg>
                </HoverTooltipContext>
            );
            return <Track {...this.props} legend={legend} visualizer={visualizer} />;
        } else {
            return <NumericalTrack {...this.props} />;
        }
    }
}

export default withDefaultOptions(withCurrentGenome(DynseqTrack));
