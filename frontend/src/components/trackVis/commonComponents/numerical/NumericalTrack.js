import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';

import BarPlot from './BarPlot';
import Track from '../Track';
import TrackLegend from '../TrackLegend';
import GenomicCoordinates from '../GenomicCoordinates';
import configOptionMerging from '../configOptionMerging';

import { RenderTypes } from '../../../../art/DesignRenderer';
import { NumericalDisplayModes } from '../../../../model/DisplayModes';
import FeatureAggregator from '../../../../model/FeatureAggregator';

export const DEFAULT_OPTIONS = {
    aggregateMethod: FeatureAggregator.AggregatorTypes.MEAN,
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
class NumericalTrack extends React.PureComponent {
    /**
     * Don't forget to look at NumericalFeatureProcessor's propTypes!
     */
    static propTypes = Object.assign({}, Track.trackContainerProps,
        {
        /**
         * NumericalFeatureProcessor provides these.  Parents should provide an array of NumericalFeature.
         */
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(Feature)
        unit: PropTypes.string, // Unit to display after the number in tooltips
        options: PropTypes.shape({
            aggregateMethod: PropTypes.oneOf(Object.values(FeatureAggregator.AggregatorTypes)).isRequired,
            displayMode: PropTypes.oneOf(Object.values(NumericalDisplayModes)).isRequired,
            height: PropTypes.number.isRequired, // Height of the track
            scaleType: PropTypes.any, // Unused for now
            scaleRange: PropTypes.array, // Unused for now
            color: PropTypes.string, // Color to draw bars, if using the default getBarElement
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
        /**
         * Callback for drawing one bar of a bar chart.
         * Signature: (x: number, value: number, scale: function): JSX.Element
         *     `x` - x coordinate to draw
         *     `record` - data to draw
         *     `scale` - d3 scale function, used to calculate height and y coordinates
         */
        getBarElement: PropTypes.func,
        getHeatmapElement: PropTypes.func,
        /**
         * Callback for getting tooltip contents to render whenever a user hovers over the visualization.
         * Signature: (relativeX: number, value: number): JSX.Element
         *     `relativeX` - coordinate of hover relative to the visualizer
         *     `records` - all data that overlap the x location
         */
        getTooltipContents: PropTypes.func,
    });

    static defaultProps = DEFAULT_OPTIONS;

    constructor(props) {
        super(props);
        const xToValue = this.aggregateFeatures(props);
        this.state = {
            xToValue: xToValue,
            ...this.computeScales(xToValue, props)
        };
        this.renderPixel = this.renderPixel.bind(this);
        this.renderDefaultBarElement = this.renderDefaultBarElement.bind(this);
        this.renderDefaultHeatmapElement = this.renderDefaultHeatmapElement.bind(this);
        this.renderDefaultTooltip = this.renderDefaultTooltip.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let didUpdateData = false;
        if (this.props.data !== nextProps.data ||
            this.props.viewRegion !== nextProps.viewRegion ||
            this.props.options.aggregateMethod !== nextProps.options.aggregateMethod
        ) {
            this.setState({xToValue: this.aggregateFeatures(nextProps)});
            didUpdateData = true;
        }

        if (didUpdateData || this.props.options !== nextProps.options) {
            this.setState(prevState => this.computeScales(prevState.xToValue, nextProps));
        }
    }

    aggregateFeatures(props) {
        const {data, viewRegion, width, options} = props;
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return aggregator.aggregate(xToFeatures, options.aggregateMethod);
    }

    computeScales(xToValue, props) {
        const min = _.min(xToValue); // Returns undefined if no data.  This will cause scales to return NaN.
        const max = _.max(xToValue);
        return {
            valueToY: scaleLinear().domain([max, min]).range([TOP_PADDING, props.options.height]).clamp(true),
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

    renderDefaultBarElement(x, y, height) {
        return <rect key={x} x={x} y={y} width={1} height={height} fill={this.props.options.color} />;
    }

    renderDefaultHeatmapElement(x, opacity) {
        const {height, color} = this.props.options;
        return <rect key={x} x={x} y={0} width={1} height={height} fill={color} fillOpacity={opacity} />;
    }

    /**
     * Gets an element to draw for a data record.
     * 
     * @return {JSX.Element} bar element to render
     */
    renderPixel(value, x) {
        if (this.getEffectiveDisplayMode() === NumericalDisplayModes.HEATMAP) {
            const opacity = this.state.valueToOpacity(value);
            const getHeatmapElement = this.props.getHeatmapElement || this.renderDefaultHeatmapElement;
            return getHeatmapElement(x, opacity);
        } else { // Assume BAR
            const y = this.state.valueToY(value);
            const height = this.props.options.height - y;
            if (height <= 0) {
                return null;
            }
            const getBarElement = this.props.getBarElement || this.renderDefaultBarElement;
            return getBarElement(x, y, height);
        }
    }

    /**
     * Renders the default tooltip that is displayed on hover.
     * 
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @param {number} value - 
     * @return {JSX.Element} tooltip to render
     */
    renderDefaultTooltip(relativeX, value) {
        const {trackModel, viewRegion, width, unit} = this.props;
        const stringValue = typeof value === "number" && !Number.isNaN(value) ? value.toFixed(2) : '(no data)';
        return (
        <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
            <li>
                <span className="Tooltip-major-text" style={{marginRight: 3}}>{stringValue}</span>
                <span className="Tooltip-minor-text">{unit}</span>
            </li>
            <li className="Tooltip-minor-text" >
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
            </li>
            <li className="Tooltip-minor-text" >{trackModel.getDisplayLabel()}</li>
        </ul>
        );
    }

    render() {
        const {width, trackModel, unit, options, getTooltipContents} = this.props;
        const legend = <TrackLegend
            trackModel={trackModel}
            height={options.height}
            axisScale={this.getEffectiveDisplayMode() === NumericalDisplayModes.BAR ? this.state.valueToY : undefined}
            axisLegend={unit}
        />;
        const visualizer = <BarPlot
            data={this.state.xToValue}
            width={width}
            height={options.height}
            htmlType={RenderTypes.CANVAS}
            options={options} // BarPlot doesn't use options, but we pass it to cue rerenders.
            getBarElement={this.renderPixel}
            getTooltipContents={getTooltipContents || this.renderDefaultTooltip}
        />;
        return <Track
            {...this.props}
            legend={legend}
            visualizer={visualizer}
        />;
    }
}

export default withDefaultOptions(NumericalTrack);
