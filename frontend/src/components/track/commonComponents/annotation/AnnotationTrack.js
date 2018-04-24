import React from 'react';
import PropTypes from 'prop-types';

import NewTrack from '../../NewTrack';

import Feature from '../../../../model/Feature';
import AnnotationRenderer from './AnnotationRenderer';
import configDataProcessing from '../configDataProcessing';
import DataProcessor from '../../../../dataSources/DataProcessor';
import LinearDrawingModel from '../../../../model/LinearDrawingModel';
import HiddenItemsMessage from '../HiddenItemsMessage';
import TrackLegend from '../TrackLegend';

const SVG_STYLE = {
    paddingTop: 5,
    display: "block",
    overflow: "visible",
};

/**
 * Filters out Features too small to see
 */
class FeatureProcessor extends DataProcessor {
    process(props) {
        if (!props.data) {
            return {
                features: [],
                numHidden: 0
            };
        }
        const drawModel = new LinearDrawingModel(props.viewRegion, props.width);
        const visibleFeatures = props.data.filter(feature => drawModel.basesToXWidth(feature.getLength()) >= 1);
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
    static propTypes = Object.assign({}, NewTrack.trackContainerProps, {
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

        /**
         * Horizontal padding between annotations.  See AnnotationRenderer for details.
         */
        getHorizontalPadding: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
        /**
         * Callback for getting a single annotation to render.  Signature: (...annotationArgs, ...visArgs): JSX.Element
         *     `annotationArgs`: arguments from AnnotationRenderer's getAnnotationElement callback
         *     `visArgs`: arguments from Track's getVisualizerElement callback
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

    renderVisualizer(viewRegion, width, viewWindow) {
        const visArgs = [viewRegion, width, viewWindow];
        const {data, rowHeight, options, getHorizontalPadding, getAnnotationElement} = this.props;
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
                    getAnnotationElement={(...annotationArgs) => getAnnotationElement(...annotationArgs, ...visArgs)}
                    options={options} // It doesn't actually use this prop, but we pass it to trigger rerenders.
                />
            </svg>
            <HiddenItemsMessage width={width} numHidden={data.numHidden} />
        </React.Fragment>
        );
    }

    render() {
        return <NewTrack
            {...this.props}
            legendElement={<TrackLegend height={this.getHeight()} {...this.props} />}
            getVisualizerElement={this.renderVisualizer}
        />;
    }
}

export default withDataProcessing(AnnotationTrack);
