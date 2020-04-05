import React from "react";
import PropTypes from "prop-types";
import memoizeOne from "memoize-one";
import _ from "lodash";
import { scaleLinear } from "d3-scale";
import Track from "../Track";
import TrackLegend from "../TrackLegend";
import configOptionMerging from "../configOptionMerging";

import { FeatureAggregator, DefaultArrayAggregators } from "../../../../model/FeatureAggregator";

// import { Graphics } from "pixi.js";
// import { PixiComponent, Stage, AppConsumer } from "@inlet/react-pixi";

import { PixiScene } from "./PixiScene";
import HoverTooltipContext from "../tooltip/HoverTooltipContext";
import GenomicCoordinates from "../GenomicCoordinates";

export const DEFAULT_OPTIONS = {
    arrayAggregateMethod: DefaultArrayAggregators.types.MEAN,
    height: 80,
    color: "blue",
    backgroundColor: "white",
    playing: true,
    speed: [10]
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);
const TOP_PADDING = 2;

/**
 * Track specialized in showing animations of numerical data array.
 *
 * @author Daofeng Li
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
            arrayAggregateMethod: PropTypes.oneOf(Object.values(DefaultArrayAggregators.types)),
            height: PropTypes.number.isRequired, // Height of the track

            color: PropTypes.string
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any // If present, applies error styling
    });

    constructor(props) {
        super(props);
        this.xToValue = null;
        this.computeScales = memoizeOne(this.computeScales);
        this.aggregateFeatures = memoizeOne(this.aggregateFeatures);
    }

    aggregateFeatures(data, viewRegion, width, aggregatorId) {
        const aggregator = new FeatureAggregator();
        const xToFeatures = aggregator.makeXMap(data, viewRegion, width);
        return xToFeatures.map(DefaultArrayAggregators.fromId(aggregatorId));
    }

    computeScales(xToValue, height) {
        const visibleValues = xToValue.slice(this.props.viewWindow.start, this.props.viewWindow.end);
        const max = _.max(visibleValues.map(x => _.max(x))) || 0; // in case undefined returned here, cause maxboth be undefined too
        const min = 0;
        return {
            valueToY: scaleLinear()
                .domain([max, min])
                .range([TOP_PADDING, height])
                .clamp(true),
            min,
            max
        };
    }

    /**
     * Renders the default tooltip that is displayed on hover.
     *
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @return {JSX.Element} tooltip to render
     */
    renderTooltip = relativeX => {
        const { trackModel, viewRegion, width } = this.props;
        const value = this.xToValue[Math.round(relativeX)];
        const stringValues = _.compact(value).length ? JSON.stringify(value) : "(no data)";
        return (
            <div>
                {stringValues}
                <div className="Tooltip-minor-text">
                    <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
                </div>
                <div className="Tooltip-minor-text">{trackModel.getDisplayLabel()}</div>
            </div>
        );
    };

    render() {
        const { data, viewRegion, width, trackModel, unit, options } = this.props;
        const { height, arrayAggregateMethod, color, backgroundColor, playing, speed } = options;
        this.xToValue = this.aggregateFeatures(data, viewRegion, width, arrayAggregateMethod);
        this.scales = this.computeScales(this.xToValue, height);
        const legend = <TrackLegend trackModel={trackModel} height={height} axisLegend={unit} />;
        const visualizer = (
            <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.renderTooltip}>
                <PixiScene
                    xToValue={this.xToValue}
                    scales={this.scales}
                    width={width}
                    height={height}
                    color={color}
                    backgroundColor={backgroundColor}
                    playing={playing}
                    speed={speed}
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

// const Rectangle = PixiComponent("Rectangle", {
//     create: props => new Graphics(),
//     applyProps: (instance, _, props) => {
//         const { x, y, width, height, fill } = props;
//         instance.clear();
//         instance.beginFill(fill);
//         instance.drawRect(x, y, width, height);
//         instance.endFill();
//     }
// });

// class PixiPlot extends React.PureComponent {
//     static propTypes = {
//         xToValue: PropTypes.array.isRequired,
//         scales: PropTypes.object.isRequired,
//         height: PropTypes.number.isRequired,
//         width: PropTypes.number.isRequired,
//         currentIndex: PropTypes.number.isRequired,
//         color: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//         backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     };

//     constructor(props) {
//         super(props);
//         this.renderPixel = this.renderPixel.bind(this);
//         this.state = {
//             currentIndex: 0
//         };
//         this.count = 0;
//         this.count2 = 0;
//     }

//     componentDidMount() {
//         this.props.app.ticker.add(this.tick);
//     }

//     componentWillUnmount() {
//         this.props.app.ticker.remove(this.tick);
//     }

//     renderPixel(value, x) {
//         if (Number.isNaN(value[0])) {
//             return null;
//         }
//         const { scales, color } = this.props;
//         const drawHeight = scales.valueToY(value[this.state.currentIndex]);
//         return <Rectangle key={x} x={x} y={TOP_PADDING} width={1} height={drawHeight} fill={color} />;
//     }
//     tick = delta => {
//         this.count += 0.05;
//         if (this.count > 9) {
//             this.count = 0;
//         }
//         this.setState({ currentIndex: Math.round(this.count) });
//     };

//     render() {
//         const { xToValue } = this.props;
//         return xToValue.map(this.renderPixel);
//     }
// }

// const PiXiApp = props => {
//     const { height, width, backgroundColor } = props;
//     return (
//         <Stage width={width} height={height} options={{ backgroundColor }}>
//             <AppConsumer>{app => <PixiPlot app={app} {...props} />}</AppConsumer>
//         </Stage>
//     );
// };

export default withDefaultOptions(DynamicNumericalTrack);
