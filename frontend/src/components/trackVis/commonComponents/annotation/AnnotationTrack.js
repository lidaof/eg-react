import React from "react";
import PropTypes from "prop-types";

import FullDisplayMode from "./FullDisplayMode";
import Track from "../Track";
import NumericalTrack from "../numerical/NumericalTrack";

import { DefaultAggregators } from "../../../../model/FeatureAggregator";
import {
    AnnotationDisplayModes,
    FiberDisplayModes,
    NumericalDisplayModes,
    VcfDisplayModes,
} from "../../../../model/DisplayModes";
import configOptionMerging from "../configOptionMerging";

export const DEFAULT_OPTIONS = {
    displayMode: AnnotationDisplayModes.FULL,
    color: "blue",
    color2: "red",
    maxRows: 20,
    height: 40, // For density display mode
    hideMinimalItems: false,
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * A component that visualizes annotations or Features.
 *
 * @author Silas Hsu
 */
export class AnnotationTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        /**
         * Features to render.  Simplified since checking is expensive.
         */
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired,
        options: PropTypes.shape({
            displayMode: PropTypes.oneOfType([
                PropTypes.oneOf(Object.values(AnnotationDisplayModes)),
                PropTypes.oneOf(Object.values(VcfDisplayModes)),
                PropTypes.oneOf(Object.values(FiberDisplayModes)),
            ]).isRequired, // Display mode
            height: PropTypes.number, // Height in density display mode
        }).isRequired,
    });

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
            return <FullDisplayMode {...this.props} />;
        }
    }
}

export default withDefaultOptions(AnnotationTrack);
