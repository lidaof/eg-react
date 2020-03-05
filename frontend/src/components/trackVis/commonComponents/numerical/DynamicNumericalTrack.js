import React from "react";
import PropTypes from "prop-types";
import memoizeOne from "memoize-one";
import _ from "lodash";
import { scaleLinear } from "d3-scale";
import Track from "../Track";
import TrackLegend from "../TrackLegend";
import configOptionMerging from "../configOptionMerging";

import { FeatureAggregator, DefaultAggregators } from "../../../../model/FeatureAggregator";

import { Graphics } from "pixi.js";
import { PixiComponent, Stage, AppConsumer } from "@inlet/react-pixi";

export const DEFAULT_OPTIONS = {
    aggregateMethod: DefaultAggregators.types.MEAN_ARRAY,
    height: 80,
    color: 0x0000ff,
    backgroundColor: 0xffffff
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
            aggregateMethod: PropTypes.oneOf(Object.values(DefaultAggregators.types)),
            height: PropTypes.number.isRequired, // Height of the track

            color: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
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
        return xToFeatures.map(DefaultAggregators.fromId(aggregatorId));
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

    render() {
        const { data, viewRegion, width, trackModel, unit, options } = this.props;
        const { height, aggregateMethod, color, backgroundColor } = options;
        this.xToValue = this.aggregateFeatures(data, viewRegion, width, aggregateMethod);
        this.scales = this.computeScales(this.xToValue, height);
        const legend = <TrackLegend trackModel={trackModel} height={height} axisLegend={unit} />;
        const visualizer = (
            <PiXiApp
                xToValue={this.xToValue}
                scales={this.scales}
                width={width}
                height={height}
                color={color}
                backgroundColor={backgroundColor}
                currentIndex={9}
            />
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

const Rectangle = PixiComponent("Rectangle", {
    create: props => new Graphics(),
    applyProps: (instance, _, props) => {
        const { x, y, width, height, fill } = props;
        instance.clear();
        instance.beginFill(fill);
        instance.drawRect(x, y, width, height);
        instance.endFill();
    }
});

class PixiPlot extends React.PureComponent {
    static propTypes = {
        xToValue: PropTypes.array.isRequired,
        scales: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        currentIndex: PropTypes.number.isRequired,
        color: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    };

    constructor(props) {
        super(props);
        this.renderPixel = this.renderPixel.bind(this);
        this.state = {
            currentIndex: 0
        };
        this.count = 0;
        this.count2 = 0;
    }

    componentDidMount() {
        this.props.app.ticker.add(this.tick);
    }

    componentWillUnmount() {
        this.props.app.ticker.remove(this.tick);
    }

    renderPixel(value, x) {
        if (Number.isNaN(value[0])) {
            return null;
        }
        const { scales, color } = this.props;
        const drawHeight = scales.valueToY(value[this.state.currentIndex]);
        return <Rectangle key={x} x={x} y={TOP_PADDING} width={1} height={drawHeight} fill={color} />;
    }
    tick = delta => {
        this.count += 0.05;
        if (this.count > 9) {
            this.count = 0;
        }
        this.setState({ currentIndex: Math.round(this.count) });
    };

    render() {
        const { xToValue } = this.props;
        return xToValue.map(this.renderPixel);
    }
}

const PiXiApp = props => {
    const { height, width, backgroundColor } = props;
    return (
        <Stage width={width} height={height} options={{ backgroundColor }}>
            <AppConsumer>{app => <PixiPlot app={app} {...props} />}</AppConsumer>
        </Stage>
    );
};

export default withDefaultOptions(DynamicNumericalTrack);
