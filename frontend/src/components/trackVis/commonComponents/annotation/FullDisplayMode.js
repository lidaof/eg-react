import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';

import Track from '../Track';
import TrackLegend from '../TrackLegend';
import HiddenItemsMessage from '../HiddenItemsMessage';

import IntervalArranger from '../../../../model/interval/IntervalArranger';
import FeatureArranger from '../../../../model/FeatureArranger';

const SVG_STYLE = {
    display: "block",
    overflow: "visible",
};
const TOP_PADDING = 5;
const DEFAULT_INTERVAL_ARRANGER = new IntervalArranger(5);

/**
 * An arranger and renderer of features, or annotations.
 * 
 * @author Silas Hsu
 */
class FullDisplayMode extends React.Component {
    static propTypes = Object.assign({}, Track.trackContainerProps, {
        /**
         * Features to render.  Simplified since checking is expensive.
         */
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired,
        intervalArranger: PropTypes.instanceOf(IntervalArranger), // Used to arrange features
        rowHeight: PropTypes.number.isRequired, // Height of each row of annotations, in pixels
        options: PropTypes.shape({
            maxRows: PropTypes.number.isRequired, // Max number of rows of annotations to render
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
        legend: PropTypes.node, // Override for the default legend element
        /**
         * Callback for getting an annotation element to render.  Signature:
         * (    
         *      feature: Feature, // Feature for which to get annotation element
         *      absLocation: OpenInterval, // Location of the feature in navigation context
         *      xLocation: OpenInterval, // x coordinate range the annotation should occupy
         *      y: number, // y coordinate of the top of the annotation
         *      isLastRow: boolean // Whether the annotation is assigned to the last configured row
         *      index: number // Iteration index; could be useful as a key
         * ): JSX.Element
         */
        getAnnotationElement: PropTypes.func.isRequired,
    });

    static defaultProps = {
        intervalArranger: DEFAULT_INTERVAL_ARRANGER
    };

    constructor(props) {
        super(props);
        this.featureArranger = new FeatureArranger();
        this.featureArranger.arrange = memoizeOne(this.featureArranger.arrange);
    }

    getHeight(numRows) {
        const {rowHeight, options} = this.props;
        const rowsToDraw = Math.min(numRows, options.maxRows);
        return rowsToDraw * rowHeight + TOP_PADDING;
    }

    render() {
        const {data, intervalArranger, viewRegion, width, rowHeight, options, getAnnotationElement} = this.props;
        // Important: it is ok to arrange() every render only because we memoized the function in the constructor.
        const arrangement = this.featureArranger.arrange(data, viewRegion, width, intervalArranger);
        const height = this.getHeight(arrangement.numRowsAssigned);
        const legend = this.props.legend || <TrackLegend height={height} trackModel={this.props.trackModel} />;
        const visualizer = <FullVisualizer
            data={arrangement}
            width={width}
            height={height}
            rowHeight={rowHeight}
            options={options} // FullVisualizer doesn't use options, but we pass to to cue rerenders.
            getAnnotationElement={getAnnotationElement}
        />;
        return <Track {...this.props} legend={legend} visualizer={visualizer} />;
    }
}

class FullVisualizer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    renderAnnotation(placedFeature, i) {
        const {rowHeight, options, getAnnotationElement} = this.props;
        const {feature, absLocation, xLocation} = placedFeature;
        const maxRowIndex = options.maxRows - 1;
        // Compute y
        const rowIndex = Math.min(placedFeature.row, maxRowIndex);
        const y = rowIndex * rowHeight + TOP_PADDING;
        return getAnnotationElement(feature, absLocation, xLocation, y, rowIndex === maxRowIndex, i);
    }

    render() {
        const {data, width, height} = this.props;
        const {featureArrangement, numHidden} = data;
        return (
        <React.Fragment>
            <svg width={width} height={height} style={SVG_STYLE} >
                {featureArrangement.map(this.renderAnnotation)}
            </svg>
            <HiddenItemsMessage width={width} numHidden={numHidden} />
        </React.Fragment>
        );
    }
}

export default FullDisplayMode;
