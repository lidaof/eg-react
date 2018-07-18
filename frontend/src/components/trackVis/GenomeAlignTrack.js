import React from 'react';
import PropTypes from 'prop-types';

import Track from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';

import { ensureMaxListLength } from '../../util';

const HEIGHT = 80;
const QUERY_GENOME_RECT_HEIGHT = 10;
const COLOR = '#B8008A';
const MAX_POLYGONS = 500;

/**
 * 
 * @author Daofeng Li
 * @author Silas Hsu
 */
export class GenomeAlignTrack extends React.Component {
    static propTypes = Track.propsFromTrackContainer;

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
        let segmentPolygons = segments.map((segment, i) => {
            const points = [
                [Math.floor(segment.targetXSpan.start), 0],
                [Math.floor(segment.queryXSpan.start), queryRectTopY],
                [Math.ceil(segment.queryXSpan.end), queryRectTopY],
                [Math.ceil(segment.targetXSpan.end), 0],
            ];
            return <polygon
                key={i}
                points={points}
                fill={COLOR}
                fillOpacity={0.5}
                onClick={() => alert("You clicked on " + segment.record.getLocus())}
            />;
        });
        segmentPolygons = ensureMaxListLength(segmentPolygons, MAX_POLYGONS);
        return <React.Fragment key={queryLocus.toString()} >
            {queryGenomeRect}
            {segmentPolygons}
        </React.Fragment>
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {width, trackModel, alignment} = this.props;
        const visualizer = <svg width={width} height={HEIGHT} style={{display: "block"}} >
            {alignment && alignment.drawData.map(this.renderMergedAlignment)}
        </svg>;
        return <Track
            {...this.props}
            visualizer={visualizer}
            legend={<TrackLegend trackModel={trackModel} height={HEIGHT} />}
        />
    }
}
