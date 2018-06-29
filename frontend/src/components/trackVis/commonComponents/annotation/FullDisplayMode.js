import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';

import Track from '../Track';
import TrackLegend from '../TrackLegend';
import { HiddenItemsMessage } from '../TrackMessage';

import { FeatureArranger, PlacedFeatureWithRow } from '../../../../model/FeatureArranger';

const SVG_STYLE = {
    display: "block",
    overflow: "visible",
};
const TOP_PADDING = 5;

/**
 * An arranger and renderer of features, or annotations.
 * 
 * @author Silas Hsu
 */
class FullDisplayMode extends React.Component {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        /**
         * Features to render.  Simplified since checking is expensive.
         */
        data: PropTypes.array.isRequired, // PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired,
        featurePadding: PropTypes.oneOfType([PropTypes.number, PropTypes.func]), // Horizontal padding for features
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
         *      placedFeature: PlacedFeature, // The feature to draw, and drawing info
         *      y: number, // Suggested y coordinate of the top of the annotation
         *      isLastRow: boolean // Whether the annotation is assigned to the last configured row
         *      index: number // Iteration index; could be useful as a key
         * ): JSX.Element
         */
        getAnnotationElement: PropTypes.func.isRequired,
    });

    static defaultProps = {
        featurePadding: 5,
    };

    constructor(props) {
        super(props);
        this.featureArranger = new FeatureArranger();
        this.featureArranger.arrange = memoizeOne(this.featureArranger.arrange);
    }

    getHeight(numRows) {
        const {rowHeight, options} = this.props;
        let rowsToDraw = Math.min(numRows, options.maxRows);
        if (rowsToDraw < 1) {
            rowsToDraw = 1;
        }
        return rowsToDraw * rowHeight + TOP_PADDING;
    }

    render() {
        const {data, featurePadding, viewRegion, width, rowHeight, options, getAnnotationElement} = this.props;
        // Important: it is ok to arrange() every render only because we memoized the function in the constructor.
        const arrangeResult = this.featureArranger.arrange(data, viewRegion, width, featurePadding);
        const height = this.getHeight(arrangeResult.numRowsAssigned);
        const legend = this.props.legend || <TrackLegend height={height} trackModel={this.props.trackModel} />;
        const visualizer = <FullVisualizer
            placements={arrangeResult.placements}
            width={width}
            height={height}
            rowHeight={rowHeight}
            maxRows={options.maxRows}
            options={options} // FullVisualizer doesn't use options, but we pass to to cue rerenders.
            getAnnotationElement={getAnnotationElement}
        />;
        const message = <HiddenItemsMessage numHidden={arrangeResult.numHidden} />;
        return <Track {...this.props} legend={legend} visualizer={visualizer} message={message}/>;
    }
}

class FullVisualizer extends React.PureComponent {
    static propTypes = {
        placements: PropTypes.array.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        rowHeight: PropTypes.number.isRequired,
        maxRows: PropTypes.number,
        getAnnotationElement: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * 
     * @param {PlacedFeatureWithRow} placedFeature 
     * @param {number} i 
     */
    renderAnnotation(placedFeature, i) {
        const {rowHeight, maxRows, getAnnotationElement} = this.props;
        const maxRowIndex = (maxRows || Infinity) - 1;
        // Compute y
        const rowIndex = Math.min(placedFeature.row, maxRowIndex);
        const y = rowIndex * rowHeight + TOP_PADDING;
        return getAnnotationElement(placedFeature, y, rowIndex === maxRowIndex, i);
    }

    render() {
        const {placements, width, height} = this.props;
        return (
        <svg width={width} height={height} style={SVG_STYLE} >
            {placements.map(this.renderAnnotation)}
        </svg>
        );
    }
}

export default FullDisplayMode;
