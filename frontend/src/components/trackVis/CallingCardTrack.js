import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { scaleLinear, scaleLog } from 'd3-scale';
import memoizeOne from 'memoize-one';
import { notify } from 'react-notify-toast';
import Track from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';
import GenomicCoordinates from './commonComponents/GenomicCoordinates';
import HoverTooltipContext from './commonComponents/tooltip/HoverTooltipContext';
import { RenderTypes, DesignRenderer } from '../../art/DesignRenderer';
import { ScaleChoices } from '../../model/ScaleChoices';
import { LogChoices } from '../../model/LogChoices';
import { FeatureAggregator } from '../../model/FeatureAggregator';

export const DEFAULT_OPTIONS = {
    height: 40,
    color: "blue",
    yScale: ScaleChoices.AUTO,
    logScale: LogChoices.AUTO,
    opacity: [100],
    yMax: 10,
    yMin: 0,
    markerSize: 3,
};

const TOP_PADDING = 5;

/**
 * Track specialized in showing calling card data.
 * 
 * @author Silas Hsu, Daofeng Li, and Arnav Moudgil
 */
class CallingCardTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer,
        {
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(CallingCard)
        options: PropTypes.shape({
            height: PropTypes.number.isRequired, // Height of the track
            color: PropTypes.string, // Color to draw circle
            scaleType: PropTypes.any, // Unused for now
            scaleRange: PropTypes.array, // Unused for now
            logScale: PropTypes.string, // For log-scaling y-axis
            opacity: PropTypes.array, // For track opacity
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
    });

    constructor(props) {
        super(props);
        this.xToValue = null;
        this.scales = null;
        // this.computeScales = memoizeOne(this.computeScales); // for some reason computeScales doesn't work when memoized
        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
        this.renderTooltip = this.renderTooltip.bind(this);
        console.log(props.options);
    }

    aggregateFeatures(data, viewRegion, width) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width, true);
        return xToFeatures;
    }

    computeScales(xToValue, height) {
        const {yScale, yMin, yMax, logScale} = this.props.options;
        if (yMin > yMax) {
            notify.show('Y-axis min must less than max', 'error', 2000);
        }
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
        // Define transformation function for log scaling
        let transformer = null;
        switch (logScale) {
            case LogChoices.AUTO:
                transformer = scaleLinear;
                break;
            case LogChoices.BASE10:
                transformer = scaleLog;
                // Set valid minimum value to one;
                // after log-transforming, it will be zero
                min = 1;
                break;
            default:
                notify.show('Invalid logarithm base', 'error', 2000);
        }
        return {
            valueToY: transformer().domain([max, min]).range([TOP_PADDING, height]).clamp(true),
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
    renderTooltip(relativeX, relativeY) {
        const {trackModel, viewRegion, width} = this.props;
        const values = this.xToValue[Math.round(relativeX)];
        // Draw tooltip only if there are values at this x position
        if (values !== undefined && values.length > 0) {
            // Find closest calling cards to the cursor along y-axis
            const nearestY = this.nearestCards(values, relativeY);
            if (nearestY.length > 0) {
                return (
                    <div>
                        <div className="Tooltip-minor-text">
                            <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
                        </div>
                        <div className="Tooltip-minor-text">{trackModel.getDisplayLabel()}</div>
                        <div className="Tooltip-minor-text">{this.formatCards(nearestY)}</div>
                    </div>
                );
            };
        };
    }

    formatCards = (cards) => {
        const head = (<thead>
            <tr>
              <th scope="col">Value</th>
              <th scope="col">Strand</th>
              <th scope="col">String</th>
            </tr>
          </thead>);
        const rows = cards.slice(0, 10).map((card,i) => <tr key={i}><td>{card.value}</td><td>{card.strand}</td><td>{card.string}</td></tr>);
        return <table className="table table-striped table-sm">{head}<tbody>{rows}</tbody></table>;
    }

    // Return closest calling cards to the cursor
    nearestCards = (cards, relativeY) => {
        const {height} = this.props.options;
        const distances = cards.map((x) => this.scales.valueToY(x.value)).map((x) => {return x - relativeY});
        const absdistances = distances.map((x) => {return Math.abs(x)});
        const mindist = Math.min(...absdistances);
        if (mindist < height * 0.03) {
            var returnCards = [];
            for (var i = 0; i < distances.length; i++) {
                if (Math.abs(distances[i]) === mindist) returnCards.push(cards[i]);
            }
            return returnCards;
        } else {
            return [];
        };
    }

    render() {
        const {data, viewRegion, width, trackModel, options, forceSvg} = this.props;
        const {height, color, colorAboveMax, markerSize, opacity} = options;
        this.xToValue = data.length > 0 ? this.aggregateFeatures(data, viewRegion, width) : [];
        this.scales = this.computeScales(this.xToValue, height);
        const legend = <TrackLegend
            trackModel={trackModel}
            height={height}
            axisScale={this.scales.valueToY}
        />;
        const visualizer = 
        (
            <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip} useRelativeY={true} >
                <CallingCardPlot
                    xToValue={this.xToValue}
                    scales={this.scales}
                    height={height}
                    color={color}
                    colorOut={colorAboveMax}
                    forceSvg={forceSvg}
                    markerSize={markerSize}
                    alpha={opacity[0]/100}
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
        alpha: PropTypes.number,
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
     * @return {JSX.Element} circle element to render
     */
    renderPixel(value, x) {
        if (value.length === 0) {
            return null;
        }
        const {scales, color, markerSize, alpha} = this.props;
        return value.map((card,idx) => {
            const y = scales.valueToY(card.value);
            const key = `${x}-${idx}`;
            return <circle key={key} cx={x} cy={y} r={markerSize} fill="none" stroke={color} strokeOpacity={alpha} />;
        });
        
    }

    render() {
        const {xToValue, height, forceSvg} = this.props;
        return <DesignRenderer type={forceSvg ? RenderTypes.SVG : RenderTypes.CANVAS} width={xToValue.length} height={height}>
            {this.props.xToValue.map(this.renderPixel)}
        </DesignRenderer>
    }
}

export default CallingCardTrack;
