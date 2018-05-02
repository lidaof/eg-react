import React from 'react';
import PropTypes from 'prop-types';

import AnnotationRenderer from './AnnotationRenderer';
import Track from '../Track';
import NumericalTrack from '../NumericalTrack';
import TrackLegend from '../TrackLegend';
import HiddenItemsMessage from '../HiddenItemsMessage';

import { AnnotationDisplayModeConfig } from '../../contextMenu/DisplayModeConfig';
import HeightConfig from '../../contextMenu/HeightConfig';
import { PrimaryColorConfig, BackgroundColorConfig } from '../../contextMenu/ColorConfig';

import { AnnotationDisplayModes, NumericalDisplayModes } from '../../../../model/DisplayModes';
import BarRecordAggregator from '../../../../model/BarRecordAggregator';
import Feature from '../../../../model/Feature';
import LinearDrawingModel from '../../../../model/LinearDrawingModel';

const SVG_STYLE = {
    display: "block",
    overflow: "visible",
};

/**
 * Some reasonable defaults for the visualization of annotations or Features.
 * 
 * @author Silas Hsu
 */
class AnnotationTrack extends React.Component {
    static propTypes = Object.assign({}, Track.trackContainerProps, {
        /**
         * Data from FeatureProcessor.  Users of AnnotationTrack need only provide an array of Feature.
         */
        data: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired, // Features to render
        rowHeight: PropTypes.number.isRequired, // Height of each row of annotations, in pixels
        options: PropTypes.shape({ // Rendering options
            height: PropTypes.number.isRequired, // Height of visualizer
            backgroundColor: PropTypes.string, // Background color
            displayMode: PropTypes.oneOf(Object.values(AnnotationDisplayModes))
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
        legend: PropTypes.node, // Override for the default legend element

        /**
         * Horizontal padding between annotations.  See AnnotationRenderer for details.
         */
        getHorizontalPadding: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        /**
         * Callback for getting a single annotation to render.  Signature: (...annotationArgs): JSX.Element
         *     `annotationArgs`: arguments from AnnotationRenderer's getAnnotationElement callback
         */
        getAnnotationElement: PropTypes.func,
    });

    constructor(props) {
        super(props);
        this.renderVisualizer = this.renderVisualizer.bind(this);
    }

    renderVisualizer() {
        const {data, viewRegion, width, rowHeight, options, getHorizontalPadding, getAnnotationElement} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const visibleData = data.filter(feature => drawModel.basesToXWidth(feature.getLength()) >= 0.5);
        const numHidden = data.length - visibleData.length;

        return (
        <React.Fragment>
            <svg width={width} height={options.height} style={SVG_STYLE} >
                <AnnotationRenderer
                    features={visibleData}
                    viewRegion={viewRegion}
                    width={width}
                    height={options.height}
                    rowHeight={rowHeight}
                    getHorizontalPadding={getHorizontalPadding}
                    getAnnotationElement={getAnnotationElement}
                    options={options} // It doesn't actually use this prop, but we pass it to trigger rerenders.
                />
            </svg>
            <HiddenItemsMessage width={width} numHidden={numHidden} />
        </React.Fragment>
        );
    }

    render() {
        const options = this.props.options;
        if (options.displayMode === AnnotationDisplayModes.DENSITY) {
            const numericalOptions = {
                ...options,
                displayMode: NumericalDisplayModes.AUTO,
                aggregateMethod: BarRecordAggregator.AggregatorTypes.COUNT
            };
            return <NumericalTrack {...this.props} unit="feature density" options={numericalOptions} />;
        } else {
            const legend = this.props.legend || <TrackLegend height={options.height} {...this.props} />;
            return <Track {...this.props} legend={legend} visualizer={this.renderVisualizer()} />;
        }
    }
}

export const SUGGESTED_MENU_ITEMS = [AnnotationDisplayModeConfig, HeightConfig, PrimaryColorConfig,
    BackgroundColorConfig];

export default AnnotationTrack;
