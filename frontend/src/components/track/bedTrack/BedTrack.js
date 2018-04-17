import React from 'react';

import { VISUALIZER_PROP_TYPES } from '../Track';
import BedAnnotation from './BedAnnotation';

import TrackLegend from '../commonComponents/TrackLegend';
import AnnotationRenderer from '../commonComponents/AnnotationRenderer';
import GeneAnnotationTrack from '../geneAnnotationTrack/GeneAnnotationTrack';

import Feature from '../../../model/Feature';
import ChromosomeInterval from '../../../model/interval/ChromosomeInterval';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import BedSource from '../../../dataSources/BedSource';

const BedColumnIndices = {
    NAME: 3,
    SCORE: 4,
    STRAND: 5,
};

const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 5,
};

const ROW_HEIGHT = BedAnnotation.HEIGHT + 2;
/**
 * Gets the height of the track.
 * 
 * @param {Object} options - options object to use to get height
 * @return {number} height of the track
 */
function getTrackHeight(options) {
    return options.rows * ROW_HEIGHT;
}

/**
 * From the raw data source records, filters out those too small to see.  Returns an object with keys `features`, which
 * are the parsed Feature from the  an array of Genes that survived filtering, and
 * `numHidden`, the the number of genes that were filtered out.
 * 
 * @param {Object[]} records - raw plain-object records
 * @param {Object} trackProps - props passed to Track
 * @return {Object} object with keys `genes` and `numHidden`.  See doc above for details
 */
function processBedRecords(records, trackProps) {
    const drawModel = new LinearDrawingModel(trackProps.viewRegion, trackProps.width);
    const visibleRecords = records.filter(record => drawModel.basesToXWidth(record.end - record.start) >= 1);
    const features = visibleRecords.map(record => new Feature(
        record[BedColumnIndices.NAME],
        new ChromosomeInterval(record.chr, record.start, record.end),
        record[BedColumnIndices.STRAND]
    ));
    return {
        features: features,
        numHidden: records.length - visibleRecords.length,
    };
}

/**
 * Visualizer for BED tracks.
 * 
 * @author Silas Hsu
 */
class BedVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    constructor(props) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    /**
     * Renders one annotation.
     * 
     * @param {Feature} feature - feature to render
     * @param {OpenInterval} absInterval - location of the feature in navigation context
     * @param {number} y - y coordinate to render the annotation
     * @param {boolean} isLastRow - whether the annotation is assigned to the last configured row
     * @return {JSX.Element} element visualizing the feature
     */
    renderAnnotation(feature, absInterval, y, isLastRow) {
        const {viewRegion, width, options} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);
        return <BedAnnotation
            key={feature.getName()}
            feature={feature}
            drawModel={drawModel}
            absLocation={absInterval}
            y={y}
            color={options.color}
        />;
    }

    render() {
        const {data, viewRegion, width, options} = this.props;
        return (
        <svg width={width} height={getTrackHeight(options) + 5} style={{paddingTop: 5, display: "block", overflow: "visible"}} >
            <AnnotationRenderer
                features={data.features || []}
                viewRegion={viewRegion}
                width={width}
                numRows={options.rows}
                rowHeight={ROW_HEIGHT}
                getAnnotationElement={this.renderAnnotation}
                getHorizontalPadding={5}
                color={options.color} // It doesn't actually use this prop, but we pass it to trigger rerenders.
            />
        </svg>
        );
    }
}

const BedTrack = {
    visualizer: BedVisualizer,
    legend: (props) => <TrackLegend height={getTrackHeight(props.options)} {...props} />,
    menuItems: GeneAnnotationTrack.menuItems,
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: trackModel => new BedSource(trackModel.url),
    processData: processBedRecords,
};

export default BedTrack;
