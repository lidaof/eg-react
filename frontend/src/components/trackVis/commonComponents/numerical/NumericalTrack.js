import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import memoizeOne from 'memoize-one';

import Track from '../Track';
import TrackLegend from '../TrackLegend';
import GenomicCoordinates from '../GenomicCoordinates';
import HoverTooltipContext from '../tooltip/HoverTooltipContext';
import configOptionMerging from '../configOptionMerging';

import { RenderTypes, DesignRenderer } from '../../../../art/DesignRenderer';
import { NumericalDisplayModes } from '../../../../model/DisplayModes';
import { FeatureAggregator, DefaultAggregators } from '../../../../model/FeatureAggregator';

export const DEFAULT_OPTIONS = {
    aggregateMethod: DefaultAggregators.types.MEAN,
    displayMode: NumericalDisplayModes.AUTO,
    height: 40,
    color: "blue",
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

const AUTO_HEATMAP_THRESHOLD = 21; // If pixel height is less than this, automatically use heatmap
const TOP_PADDING = 3;

/**
 * Track specialized in showing numerical data.
 * 
 * @author Silas Hsu
 */
class NumericalTrack extends React.Component {
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
        this.scales = null;

        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
        this.computeScales = memoizeOne(this.computeScales);
        this.renderTooltip = this.renderTooltip.bind(this);
    }

    aggregateFeatures(data, viewRegion, width, aggregatorId) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return xToFeatures.map( DefaultAggregators.fromId(aggregatorId) );
    }

    computeScales(xToValue, height) {
        const min = _.min(xToValue); // Returns undefined if no data.  This will cause scales to return NaN.
        const max = _.max(xToValue);
        return {
            valueToY: scaleLinear().domain([max, min]).range([TOP_PADDING, height]).clamp(true),
            valueToOpacity: scaleLinear().domain([min, max]).range([0, 1]).clamp(true),
        };
    }

    getEffectiveDisplayMode() {
        const {displayMode, height} = this.props.options;
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
        const {trackModel, viewRegion, width, unit} = this.props;
        const value = this.xToValue[relativeX];
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
        const {data, viewRegion, width, trackModel, unit, options} = this.props;
        const {height, color, aggregateMethod} = options;
        const isDrawingBars = this.getEffectiveDisplayMode() === NumericalDisplayModes.BAR; // As opposed to heatmap
        this.xToValue = this.aggregateFeatures(data, viewRegion, width, aggregateMethod);
        this.scales = this.computeScales(this.xToValue, height);
        
        const legend = <TrackLegend
            trackModel={trackModel}
            height={height}
            axisScale={isDrawingBars ? this.scales.valueToY : undefined}
            axisLegend={unit}
        />;
        const visualizer = (
            <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip} >
                <ValuePlot
                    xToValue={this.xToValue}
                    scales={this.scales}
                    height={height}
                    color={color}
                    isDrawingBars={isDrawingBars}
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

class ValuePlot extends React.PureComponent {
    static propTypes = {
        xToValue: PropTypes.array.isRequired,
        scales: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        color: PropTypes.string,
        isDrawingBars: PropTypes.bool,
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
        if (!value || Number.isNaN(value)) {
            return null;
        }

        const {isDrawingBars, scales, height, color} = this.props;
        if (isDrawingBars) {
            const y = scales.valueToY(value);
            const drawHeight = height - y;
            if (drawHeight <= 0) {
                return null;
            }
            return <rect key={x} x={x} y={y} width={1} height={drawHeight} fill={color} />;
        } else { // Assume HEATMAP
            const opacity = scales.valueToOpacity(value);
            return <rect key={x} x={x} y={0} width={1} height={height} fill={color} fillOpacity={opacity} />;
        }
    }

    render() {
        const {xToValue, height} = this.props;
        return <DesignRenderer type={RenderTypes.CANVAS} width={xToValue.length} height={height}>
            {this.props.xToValue.map(this.renderPixel)}
        </DesignRenderer>
    }
}

export default withDefaultOptions(NumericalTrack);
