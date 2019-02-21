import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import memoizeOne from 'memoize-one';
import { notify } from 'react-notify-toast';
import Track from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';
import GenomicCoordinates from './commonComponents/GenomicCoordinates';
import HoverTooltipContext from './commonComponents/tooltip/HoverTooltipContext';
import configOptionMerging from './commonComponents/configOptionMerging';
import { RenderTypes, DesignRenderer } from '../../art/DesignRenderer';
import { ScaleChoices } from '../../model/ScaleChoices';
import { FeatureAggregator } from '../../model/FeatureAggregator';

export const DEFAULT_OPTIONS = {
    height: 40,
    color: "blue",
    yScale: ScaleChoices.AUTO,
    yMax: 10,
    yMin: 0,
    markerSize: 5,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

const TOP_PADDING = 3;

/**
 * Track specialized in showing numerical data.
 * 
 * @author Silas Hsu and Daofeng Li
 */
class CallingCardTrack extends React.PureComponent {
    /**
     * Don't forget to look at NumericalFeatureProcessor's propTypes!
     */
    static propTypes = Object.assign({}, Track.propsFromTrackContainer,
        {
        /**
         * NumericalFeatureProcessor provides these.  Parents should provide an array of NumericalFeature.
         */
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(Feature)
        unit: PropTypes.string, // Unit to display after the number in tooltips
        options: PropTypes.shape({
            height: PropTypes.number.isRequired, // Height of the track
            color: PropTypes.string, // Color to draw bars, if using the default getBarElement
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
    });

    constructor(props) {
        super(props);
        this.xToValue = null;
        this.scales = null;
        this.computeScales = memoizeOne(this.computeScales);
        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    aggregateFeatures(data, viewRegion, width) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return xToFeatures;
    }

    computeScales(xToValue, height) {
        const {yScale, yMin, yMax} = this.props.options;
        if (yMin > yMax) {
            notify.show('Y-axis min must less than max', 'error', 2000);
        }
        /*
        All tracks get `PropsFromTrackContainer` (see `Track.ts`).

        `props.viewWindow` contains the range of x that is visible when no dragging.  
            It comes directly from the `ViewExpansion` object from `RegionExpander.ts`
        */
        const visibleValues = xToValue.slice(this.props.viewWindow.start, this.props.viewWindow.end);
        let max = _.max(_.flatten(visibleValues).map(x => x.value)) || 0; // in case undefined returned here, cause maxboth be undefined too
        let min = 0;
        if (yScale === ScaleChoices.FIXED) {
            max = yMax ? yMax : max;
            min = yMin ? yMin : min;
        }
        if (min > max) {
            min = max;
        }
        return {
            valueToY: scaleLinear().domain([max, min]).range([TOP_PADDING, height]).clamp(true),
            min,
            max,
        };
    }

    /**
     * Renders the default tooltip that is displayed on hover.
     * 
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @param {number} value - 
     * @return {JSX.Element} tooltip to render
     */
    renderTooltip(relativeX) {
        const {trackModel, viewRegion, width, unit} = this.props;
        const value = this.xToValue[Math.round(relativeX)];
        const stringValue = typeof value === "number" && !Number.isNaN(value) ? value.toFixed(2) : '(no data)';
        return (
        <div>
            <div>
                <span className="Tooltip-major-text" style={{marginRight: 3}}>{stringValue}</span>
                {unit && <span className="Tooltip-minor-text">{unit}</span>}
            </div>
            <div className="Tooltip-minor-text" >
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
            </div>
            <div className="Tooltip-minor-text" >{trackModel.getDisplayLabel()}</div>
        </div>
        );
    }

    render() {
        const {data, viewRegion, width, trackModel, unit, options, forceSvg} = this.props;
        const {height, color, colorAboveMax, markerSize} = options;
        this.xToValue = data.length > 0 ? this.aggregateFeatures(data, viewRegion, width) : [];
        this.scales = this.computeScales(this.xToValue, height);
        const legend = <TrackLegend
            trackModel={trackModel}
            height={height}
            axisScale={this.scales.valueToY }
            axisLegend={unit}
        />;
        const visualizer = 
        (
            <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip} >
                <CallingCardPlot
                    xToValue={this.xToValue}
                    scales={this.scales}
                    height={height}
                    color={color}
                    colorOut={colorAboveMax}
                    forceSvg={forceSvg}
                    markerSize={markerSize}
                />
            </HoverTooltipContext>
        );
        return <Track
            {...this.props}
            legend={legend}
            visualizer={visualizer}
        />;
    }
}

class CallingCardPlot extends React.PureComponent {
    static propTypes = {
        xToValue: PropTypes.array.isRequired,
        scales: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        color: PropTypes.string,
        markerSize: PropTypes.number,
    }

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
        if (value.length === 0) {
            return null;
        }
        const {scales, color, markerSize} = this.props;
        return value.map((card,idx) => {
            const y = scales.valueToY(card.value);
            const key = `${x}-${idx}`;
            return <circle key={key} cx={x} cy={y} r={markerSize} fill="none" stroke={color} stroke-opacity="0.7"/>;
        });
        
    }

    render() {
        const {xToValue, height, forceSvg} = this.props;
        return <DesignRenderer type={1 ? RenderTypes.SVG : RenderTypes.CANVAS} width={xToValue.length} height={height}>
            {this.props.xToValue.map(this.renderPixel)}
        </DesignRenderer>
    }
}

export default withDefaultOptions(CallingCardTrack);
