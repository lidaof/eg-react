import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';

import Track from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';

// import { GenomeAlignDisplayModes } from '../../model/DisplayModes';
import { AlignmentProcessor } from '../../model/AlignmentProcessor';
import OpenInterval from '../../model/interval/OpenInterval';

const HEIGHT = 60;
const QUERY_GENOME_RECT_HEIGHT = 10;
const COLOR = '#B8008A';

/**
 * 
 * @author Daofeng Li
 * @author Silas Hsu
 */
export class GenomeAlignTrack extends React.Component {
    static propTypes = Object.assign({},
        Track.propsFromTrackContainer,
        {
        data: PropTypes.array.isRequired, 
        }
    );

    constructor(props) {
        super(props);
        this.alignmentProcessor = new AlignmentProcessor();
        this.alignmentProcessor.mergeAndPlaceAlignments = memoizeOne(this.alignmentProcessor.mergeAndPlaceAlignments);
    }

    renderMergedAlignment(placement) {
        const {queryLocus, queryXSpan, segments} = placement;
        const queryRectTopY = HEIGHT - QUERY_GENOME_RECT_HEIGHT;
        const queryGenomeRect = <rect
            x={queryXSpan.start}
            y={queryRectTopY}
            width={queryXSpan.getLength()}
            height={QUERY_GENOME_RECT_HEIGHT}
            fill={COLOR}
            onClick={() => alert("You clicked on " + queryLocus)}
        />;
        const segmentPolygons = segments.map((segment, i) => {
            const points = [
                [segment.targetXSpan.start, 0],
                [segment.queryXSpan.start, queryRectTopY],
                [segment.queryXSpan.end, queryRectTopY],
                [segment.targetXSpan.end, 0],
            ];
            return <polygon
                key={i}
                points={points}
                fill={COLOR}
                fillOpacity={0.5}
                onClick={() => alert("You clicked on " + segment.record.getLocus())}
            />;
        });
        return <React.Fragment key={queryLocus.toString()} >
            {queryGenomeRect}
            {segmentPolygons}
        </React.Fragment>
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {viewRegion, width, viewWindow, trackModel, options, data} = this.props;
        const placements = this.alignmentProcessor.mergeAndPlaceAlignments(data, viewRegion, width);
        const visualizer = <svg width={width} height={HEIGHT}>{placements.map(this.renderMergedAlignment)}</svg>
        return <Track
            {...this.props}
            viewWindow={new OpenInterval(0, width)}
            visualizer={visualizer}
            legend={<TrackLegend trackModel={trackModel} height={HEIGHT} />}
        />
    }
}
