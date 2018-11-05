import React from 'react';
import memoizeOne from 'memoize-one';

import Track, { PropsFromTrackContainer } from '../Track';
import TrackLegend from '../TrackLegend';
import { HiddenItemsMessage } from '../TrackMessage';

import { FeatureArranger, PlacedFeatureGroup, PaddingFunc } from '../../../../model/FeatureArranger';
import { Feature } from '../../../../model/Feature';

const SVG_STYLE = {
    display: "block",
    overflow: "visible",
};
const TOP_PADDING = 0;

/**
 * Callback for getting an annotation to render
 * 
 * @param {PlacedFeatureGroup} placedGroup - the feature to draw, and drawing info
 * @param {number} y - suggested y coordinate of the top of the annotation
 * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
 * @param {number} index - iteration index; could be useful as a key
 * @return {JSX.Element} the annotation element to render
 */
type AnnotationCallback = (placedGroup: PlacedFeatureGroup, y: number, isLastRow: boolean, index: number) => JSX.Element

interface FullDisplayModeProps extends PropsFromTrackContainer {
    data: Feature[]; // Features to render
    rowHeight: number; // Height of each row of annotations, in pixels
    options: {
        maxRows: number; // Max number of rows of annotations to render
    };

    legend?: JSX.Element; // Override for the default legend element
    featurePadding?: number | PaddingFunc; // Horizontal padding for features
    getAnnotationElement?: AnnotationCallback
}

/**
 * An arranger and renderer of features, or annotations.
 * 
 * @author Silas Hsu
 */
class FullDisplayMode extends React.Component<FullDisplayModeProps> {
    static defaultProps = {
        featurePadding: 5,
    };

    private featureArranger: FeatureArranger;

    constructor(props: FullDisplayModeProps) {
        super(props);
        this.featureArranger = new FeatureArranger();
        this.featureArranger.arrange = memoizeOne(this.featureArranger.arrange);
    }

    getHeight(numRows: number): number {
        const {rowHeight, options} = this.props;
        const rowsToDraw = Math.min(numRows, options.maxRows) + 1;
        // if (rowsToDraw < 1) {
        //     rowsToDraw = 1;
        // }
        return rowsToDraw * rowHeight + TOP_PADDING;
    }

    render() {
        const {data, featurePadding, visRegion, width, rowHeight, options, getAnnotationElement} = this.props;
        // Important: it is ok to arrange() every render only because we memoized the function in the constructor.
        const arrangeResult = this.featureArranger.arrange(data, visRegion, width, featurePadding);
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

interface FullVisualizerProps {
    placements: PlacedFeatureGroup[];
    width: number;
    height: number;
    rowHeight: number;
    maxRows: number;
    getAnnotationElement: AnnotationCallback;
    options?: any;
}

class FullVisualizer extends React.PureComponent<FullVisualizerProps> {
    constructor(props: FullVisualizerProps) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * 
     * @param {PlacedFeatureGroup} placedGroup 
     * @param {number} i 
     */
    renderAnnotation(placedGroup: PlacedFeatureGroup, i: number) {
        const {rowHeight, maxRows, getAnnotationElement} = this.props;
        const maxRowIndex = (maxRows || Infinity);
        // Compute y
        const rowIndex = Math.min(placedGroup.row, maxRowIndex);
        const y = rowIndex * rowHeight + TOP_PADDING;
        return getAnnotationElement(placedGroup, y, rowIndex === maxRowIndex, i);
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
