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
import { RenderTypes, DesignRenderer } from '../../art/DesignRenderer';
import { ScaleChoices } from '../../model/ScaleChoices';
import { FeatureAggregator } from '../../model/FeatureAggregator';

export const DEFAULT_OPTIONS = {
    height: 40,
    color: "blue",
    yScale: ScaleChoices.AUTO,
    yMax: 10,
    yMin: 0,
    markerSize: 3,
};

const TOP_PADDING = 5;

/**
 * Track specialized in showing calling card data.
 * 
 * @author Silas Hsu and Daofeng Li
 */
class CallingCardTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer,
        {
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(CallingCard)
        options: PropTypes.shape({
            height: PropTypes.number.isRequired, // Height of the track
            color: PropTypes.string, // Color to draw circle
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
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width, true);
        return xToFeatures;
    }

    computeScales(xToValue, height) {
        const {yScale, yMin, yMax} = this.props.options;
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
        const {trackModel, viewRegion, width} = this.props;
        const value = this.xToValue[Math.round(relativeX)];
        const stringValue = value !== undefined && value.length > 0 ? this.formatCards(value) : '(no data)';
        return (
        <div>
            <div className="Tooltip-minor-text">
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
            </div>
            <div className="Tooltip-minor-text">{trackModel.getDisplayLabel()}</div>
            <div className="Tooltip-minor-text">{stringValue}</div>
        </div>
        );
    }

    formatCards = (cards) => {
        const head = (<thead>
            <tr>
              <th scope="col">Barcode</th>
              <th scope="col">Count</th>
            </tr>
          </thead>);
        const rows = cards.slice(0, 10).map((card,i) => <tr key={i}><td>{card.barcode}</td><td>{card.value}</td></tr>);
        return <table className="table table-striped table-sm">{head}<tbody>{rows}</tbody></table>;
    }

    render() {
        const {data, viewRegion, width, trackModel, options, forceSvg} = this.props;
        const {height, color, colorAboveMax, markerSize} = options;
        this.xToValue = data.length > 0 ? this.aggregateFeatures(data, viewRegion, width) : [];
        this.scales = this.computeScales(this.xToValue, height);
        const legend = <TrackLegend
            trackModel={trackModel}
            height={height}
            axisScale={this.scales.valueToY }
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
     * @return {JSX.Element} circle element to render
     */
    renderPixel(value, x) {
        if (value.length === 0) {
            return null;
        }
        const {scales, color, markerSize} = this.props;
        return value.map((card,idx) => {
            const y = scales.valueToY(card.value);
            const key = `${x}-${idx}`;
            return <circle key={key} cx={x} cy={y} r={markerSize} fill="none" stroke={color} strokeOpacity="0.5"/>;
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
