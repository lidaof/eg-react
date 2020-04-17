import React from "react";
import PropTypes from "prop-types";

import FullDisplayMode from "./FullDisplayMode";
import Track from "../Track";
import NumericalTrack from "../numerical/NumericalTrack";

import { DefaultAggregators } from "../../../../model/FeatureAggregator";
import { AnnotationDisplayModes, NumericalDisplayModes } from "../../../../model/DisplayModes";
import configOptionMerging from "../configOptionMerging";

export const DEFAULT_OPTIONS = {
    displayMode: AnnotationDisplayModes.FULL,
    color: "blue",
    color2: "red",
    maxRows: 20,
    height: 40, // For density display mode
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * A component that visualizes annotations or Features.
 *
 * @author Silas Hsu
 */
class AnnotationTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        /**
         * Features to render.  Simplified since checking is expensive.
         */
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired,
        options: PropTypes.shape({
            displayMode: PropTypes.oneOf(Object.values(AnnotationDisplayModes)).isRequired, // Display mode
            height: PropTypes.number, // Height in density display mode
        }).isRequired,
    });

    paddingFunc = (feature, xSpan) => {
        const width = xSpan.endX - xSpan.startX;
        const estimatedLabelWidth = feature.getName().length * 9;
        if (estimatedLabelWidth < 0.5 * width) {
            return 5;
        } else {
            return 9 + estimatedLabelWidth;
        }
    };

    render() {
        if (this.props.options.displayMode === AnnotationDisplayModes.DENSITY) {
            const numericalOptions = {
                ...this.props.options,
                displayMode: NumericalDisplayModes.AUTO,
                aggregateMethod: DefaultAggregators.types.COUNT,
            };
            return <NumericalTrack {...this.props} unit="feature density" options={numericalOptions} />;
        } else {
            // Assume FULL display mode
            return <FullDisplayMode {...this.props} featurePadding={this.paddingFunc} />;
        }
    }
}

export default withDefaultOptions(AnnotationTrack);
