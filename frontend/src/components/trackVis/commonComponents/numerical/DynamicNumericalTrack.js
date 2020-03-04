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
    aggregateMethod: DefaultAggregators.types.MEAN_ARRAY,
    height: 80,
    color: "blue"
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

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
        console.log(xToFeatures);
        return xToFeatures.map(DefaultAggregators.fromId(aggregatorId));
    }

    render() {
        const { data, viewRegion, width, trackModel, unit, options, forceSvg } = this.props;
        const { height, aggregateMethod } = options;
        this.xToValue = this.aggregateFeatures(data, viewRegion, width, aggregateMethod);
        // console.log(this.props);
        // console.log(this.xToValue);
        const legend = <TrackLegend trackModel={trackModel} height={height} axisLegend={unit} />;
        const visualizer = <p>aaa</p>;
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

export default withDefaultOptions(DynamicNumericalTrack);
