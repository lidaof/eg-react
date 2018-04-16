import React from 'react';

import { VISUALIZER_PROP_TYPES } from './Track';
import TrackLegend from './commonComponents/TrackLegend';
import AnnotationRenderer from './commonComponents/AnnotationRenderer';
import Feature from '../../model/Feature';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import BedSource from '../../dataSources/BedSource';

import LinearDrawingModel from '../../model/LinearDrawingModel';

const BedColumnIndices = {
    NAME: 3,
    SCORE: 4,
    STRAND: 5,
};

const DEFAULT_OPTIONS = {
    color: "blue",
    rows: 5,
};

const ROW_HEIGHT = 12;

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

class BedVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    constructor(props) {
        super(props);
        this.renderAnnotation = this.renderAnnotation.bind(this);
    }

    renderAnnotation(feature, absInterval, y, isLastRow) {
        const {viewRegion, width, options} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);
        return <rect
            key={absInterval.start + y} // TODO get a better key
            x={drawModel.baseToX(absInterval.start)}
            y={y}
            width={drawModel.basesToXWidth(absInterval.getLength())}
            height={ROW_HEIGHT - 4}
            fill={options.color}
        />;
    }

    render() {
        const {data, viewRegion, width, options} = this.props;
        return (
        <svg width={width} height={options.rows * ROW_HEIGHT + 5} style={{paddingTop: 5, display: "block", overflow: "visible"}} >
            <AnnotationRenderer
                features={data.features || []}
                viewRegion={viewRegion}
                width={width}
                numRows={options.rows}
                rowHeight={ROW_HEIGHT}
                getAnnotationElement={this.renderAnnotation}
                color={options.color} // It doesn't actually use this prop, but we pass it to trigger rerenders.
            />
        </svg>
        );
    }
}

const BedTrack = {
    visualizer: BedVisualizer,
    legend: (props) => <TrackLegend height={props.options.rows * ROW_HEIGHT} {...props} />,
    menuItems: GeneAnnotationTrack.menuItems,
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: trackModel => new BedSource(trackModel.url),
    processData: processBedRecords,
};

export default BedTrack;
