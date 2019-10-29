import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import memoizeOne from 'memoize-one';
import { notify } from 'react-notify-toast';
import Smooth from 'array-smooth';
import Track from '../Track';
import TrackLegend from '../TrackLegend';
import GenomicCoordinates from '../GenomicCoordinates';
import HoverTooltipContext from '../tooltip/HoverTooltipContext';
import configOptionMerging from '../configOptionMerging';
import RulerTrack from '../../ImportanceTrack';
import Chromosomes from '../../../genomeNavigator/ImportanceChromosomes';
import { Sequence } from '../../../ImportanceSequence';
import { getGenomeConfig } from '../../../../model/genomes/allGenomes';

import DisplayedRegionModel from '../../../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../../../model/LinearDrawingModel';
import withCurrentGenome from '../../../withCurrentGenome';


import { RenderTypes, DesignRenderer } from '../../../../art/DesignRenderer';
import { NumericalDisplayModes } from '../../../../model/DisplayModes';
import { FeatureAggregator, DefaultAggregators } from '../../../../model/FeatureAggregator';
import { ScaleChoices } from '../../../../model/ScaleChoices';

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
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);
const CHROMOSOMES_Y = 60;
const AUTO_HEATMAP_THRESHOLD = 21; // If pixel height is less than this, automatically use heatmap
const TOP_PADDING = 2;
const THRESHOLD_HEIGHT = 3; // the bar tip height which represet value above max or below min

/**
 * Track specialized in showing numerical data.
 * 
 * @author Silas Hsu
 */
class ImportanceNumericalTrack extends React.PureComponent {
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
        width: PropTypes.number.isRequired, //Width of base letter
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize        
    });

    constructor(props) {
        super(props);
        this.xToValue = null;
        this.xToValue2 = null;
        this.scales = null;
        this.hasReverse = false;
        console.debug("FROM CONSTRUCTOR IMPNUMSCOR");
        console.debug(props.data);
        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
        this.computeScales = memoizeOne(this.computeScales);
        console.debug("DONE COMPUTE SCALES");
    }

    aggregateFeatures(data, viewRegion, width, aggregatorId) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return xToFeatures.map( DefaultAggregators.fromId(aggregatorId) );
    }

    computeScales(xToValue, xToValue2, height) {
        const {yScale, yMin, yMax} = this.props.options;
        if (yMin > yMax) {
            notify.show('Y-axis min must less than max', 'error', 2000);
        }

        if (yMin > 0) {
            notify.show('Y-axis min > 0 not supported', 'error', 2000);
        }
        /*
        All tracks get `PropsFromTrackContainer` (see `Track.ts`).

        `props.viewWindow` contains the range of x that is visible when no dragging.  
            It comes directly from the `ViewExpansion` object from `RegionExpander.ts`
        */
        const visibleValues = xToValue.slice(this.props.viewWindow.start, this.props.viewWindow.end);
        let max = _.max(visibleValues) || 0; // in case undefined returned here, cause maxboth be undefined too
        let min = (xToValue2.length > 0 ? _.min(xToValue2.slice(this.props.viewWindow.start, this.props.viewWindow.end)) : 0 ) || 0;
        
        // const maxBoth = Math.max(Math.abs(max), Math.abs(min));
        // max = maxBoth;
        // min = xToValue2.length > 0 ? -maxBoth : 0;
        
        if (yScale === ScaleChoices.FIXED) {
            max = yMax ? yMax : max;
            min = yMin ? yMin : min;
        }
        if (min > max) {
            min = max;
        }

        // determines the distance of y=0 from the top
        let zeroLine = min < 0 ? TOP_PADDING + (height-TOP_PADDING)*max/(max + Math.abs(min)) : height;

        if (xToValue2.length > 0) {
            return {
                valueToHeight: scaleLinear().domain([min, max]).range([zeroLine-height, zeroLine-TOP_PADDING]),
                valueToY: scaleLinear().domain([max, 0]).range([TOP_PADDING, zeroLine]).clamp(true),
                valueToYReverse: scaleLinear().domain([0, min]).range([0, zeroLine - TOP_PADDING]).clamp(true),
                valueToOpacity: scaleLinear().domain([0, max]).range([0, 1]).clamp(true),
                valueToOpacityReverse: scaleLinear().domain([0, min]).range([0, 1]).clamp(true),
                min,
                max,
                zeroLine
            };
        } else {
            return {
                valueToHeight: scaleLinear().domain([min, max]).range([zeroLine-height, zeroLine-TOP_PADDING]),
                valueToY: scaleLinear().domain([max, min]).range([TOP_PADDING, height]).clamp(true),
                valueToOpacity: scaleLinear().domain([min, max]).range([0, 1]).clamp(true),
                min,
                max,
                zeroLine
            };
        }
    }

    
    getEffectiveDisplayMode() {
        const {displayMode, height} = this.props.options;  
        const drawModel = new LinearDrawingModel(this.props.viewRegion, this.props.width);

        if (displayMode === NumericalDisplayModes.AUTO) {
            return drawModel.basesToXWidth(1) < Sequence.MIN_X_WIDTH_PER_BASE ? NumericalDisplayModes.HEATMAP : NumericalDisplayModes.BAR;
        } else {
            return displayMode;
        }
    }



    render() {
        const {data, viewRegion, width, trackModel, unit, options, forceSvg} = this.props;
        const {height, color, color2, aggregateMethod, colorAboveMax, color2BelowMin, smooth} = options;
        
        const halfHeight = height * 0.5;
        const dataForward = data.filter(feature => feature.value === undefined || feature.value >= 0); // bed track to density mode
        const dataReverse = data.filter(feature => feature.value < 0);
        let xToValue2BeforeSmooth;
        if (dataReverse.length > 0) {
            this.hasReverse = true;
            xToValue2BeforeSmooth = this.aggregateFeatures(dataReverse, viewRegion, width, aggregateMethod);
        } else {
            xToValue2BeforeSmooth = [];
        }
        this.xToValue2 = smooth === 0 ? xToValue2BeforeSmooth: Smooth(xToValue2BeforeSmooth, smooth);
        const isDrawingBars = this.getEffectiveDisplayMode() === NumericalDisplayModes.BAR; // As opposed to heatmap
        const xToValueBeforeSmooth = dataForward.length > 0 ? this.aggregateFeatures(dataForward, viewRegion, width, aggregateMethod) : [];
        this.xToValue = smooth === 0 ? xToValueBeforeSmooth: Smooth(xToValueBeforeSmooth, smooth);
        this.scales = this.computeScales(this.xToValue, this.xToValue2, height);
        const legend = <TrackLegend
            trackModel={trackModel}
            height={height}
            axisScale={isDrawingBars ? this.scales.valueToY : undefined}
            axisScaleReverse={isDrawingBars ? this.scales.valueToYReverse : undefined}
            axisLegend={unit}
        />;
        if (!isDrawingBars) {            
            const visualizer = <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip} >
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

            return <Track
                {...this.props}
                // style={{paddingBottom: "5px"}}
                legend={legend}
                visualizer={visualizer}
            />;
        }

        // const visualizer = <Visualizer getGenomeConfig={this.genomeConfig} viewRegion={viewRegion} width={width} trackModel={trackModel}  />;
        // this converts to absolute value also
        let drawHeights = this.xToValue.map(this.scales.valueToHeight);
        let allValues = this.xToValue;

        if (this.xToValue2.length>0) {
            let negHeights = this.xToValue2.map(this.scales.valueToHeight);
            drawHeights = drawHeights.map(function(num, idx) {
                return (num || 0) + (negHeights[idx] || 0);
            });
            
            let x2V2 = this.xToValue2;
            allValues = allValues.map(function(num, idx) {
                return (num || 0) + (x2V2[idx] || 0);
            })
        }


        return RulerTrack(this.props,  allValues, drawHeights, this.scales.zeroLine, legend);

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
        const {isDrawingBars, scales, height, color, colorOut} = this.props;
        const y = value > 0 ? scales.valueToY(value) : scales.valueToYReverse(value);
        let drawY = value > 0 ? y : 0 ;
        let drawHeight = value > 0 ? height - y : y;
        
        if (isDrawingBars) {
            // const y = scales.valueToY(value);
            // const drawHeight = height - y;
            if (drawHeight <= 0) {
                return null;
            }
            let tipY;
            if (value > scales.max || value < scales.min) {
                drawHeight -= THRESHOLD_HEIGHT
                if (value > scales.max) {
                    tipY = y;
                    drawY += THRESHOLD_HEIGHT;
                } else {
                    tipY = drawHeight;
                }
                return <g key={x}>
                        <rect key={x} x={x} y={drawY} width={1} height={drawHeight} fill={color} />
                        <rect key={x+'tip'} x={x} y={tipY} width={1} height={THRESHOLD_HEIGHT} fill={colorOut} />
                    </g>;
            } else {
                return <rect key={x} x={x} y={drawY} width={1} height={drawHeight} fill={color} />;
            }
            
        } else { // Assume HEATMAP
            const opacity = value > 0 ? scales.valueToOpacity(value) : scales.valueToOpacityReverse(value);
            return <rect key={x} x={x} y={0} width={1} height={height} fill={color} fillOpacity={opacity} />;
        }
    }

    render() {
        const {xToValue, height, forceSvg} = this.props;
        return <DesignRenderer type={forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS} width={xToValue.length} height={height}>
            {this.props.xToValue.map(this.renderPixel)}
        </DesignRenderer>
    }
}

export default withDefaultOptions(ImportanceNumericalTrack);
