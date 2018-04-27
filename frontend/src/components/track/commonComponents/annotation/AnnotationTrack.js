import React from 'react';
import PropTypes from 'prop-types';

import Track from '../Track';

import Feature from '../../../../model/Feature';
import AnnotationRenderer from './AnnotationRenderer';
import configDataProcessing from '../configDataProcessing';
import DataProcessor from '../../../../dataSources/DataProcessor';
import LinearDrawingModel from '../../../../model/LinearDrawingModel';
import HiddenItemsMessage from '../HiddenItemsMessage';
import TrackLegend from '../TrackLegend';

const SVG_STYLE = {
    display: "block",
    overflow: "visible",
};

/**
 * Filters out Features too small to see.
 */
class FeatureProcessor extends DataProcessor {
    getInputPropTypes() {
        return {
            data: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired
        };
    }

    process(props) {
        if (!props.data) {
            return {
                features: [],
                numHidden: 0
            };
        }
        const drawModel = new LinearDrawingModel(props.viewRegion, props.width);
        const visibleFeatures = props.data.filter(feature => drawModel.basesToXWidth(feature.getLength()) >= 0.5);
        return {
            features: visibleFeatures,
            numHidden: props.data.length - visibleFeatures.length
        };
    }
}
const withDataProcessing = configDataProcessing(new FeatureProcessor());

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
        data: PropTypes.shape({
            features: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired, // Features to render
            numHidden: PropTypes.number // Number of Features that FeatureProcessor hid
        }).isRequired,
        rowHeight: PropTypes.number.isRequired, // Height of each row of annotations, in pixels
        options: PropTypes.shape({ // Rendering options
            rows: PropTypes.number.isRequired, // Number of rows of annotations
            backgroundColor: PropTypes.string, // Background color
            displayMode: PropTypes.any // Unused for now.
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

    /**
     * @return {number} the height of the track
     */
    getHeight() {
        return this.props.options.rows * this.props.rowHeight;
    }

    renderVisualizer() {
        const {data, viewRegion, width, rowHeight, options, getHorizontalPadding, getAnnotationElement} = this.props;
        return (
        <React.Fragment>
            <svg width={width} height={this.getHeight()} style={SVG_STYLE} >
                <AnnotationRenderer
                    features={data.features}
                    viewRegion={viewRegion}
                    width={width}
                    numRows={options.rows}
                    rowHeight={rowHeight}
                    getHorizontalPadding={getHorizontalPadding}
                    getAnnotationElement={getAnnotationElement}
                    options={options} // It doesn't actually use this prop, but we pass it to trigger rerenders.
                />
            </svg>
            <HiddenItemsMessage width={width} numHidden={data.numHidden} />
        </React.Fragment>
        );
    }

    render() {
        const legend = this.props.legend || <TrackLegend height={this.getHeight()} {...this.props} />;
        return <Track
            {...this.props}
            legend={legend}
            visualizer={this.renderVisualizer()}
        />;
    }
}

export default withDataProcessing(AnnotationTrack);
