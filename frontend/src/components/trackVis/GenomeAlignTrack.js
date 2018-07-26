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

    constructor(props) {
        super(props);
        this.renderFineAlignment = this.renderFineAlignment.bind(this);
    }

    renderFineAlignment(placement, i) {
        const {targetXSpan, targetSegments, querySegments} = placement;
        const [xStart, xEnd] = targetXSpan;
        const targetRects = targetSegments.filter(segment => !segment.isGap).map((segment, i) =>
            <rect key={i} x={segment.xSpan.start} y={0} width={segment.xSpan.getLength()} height={10} fill="darkblue" />
        );
        const queryRects = querySegments.filter(segment => !segment.isGap).map((segment, i) =>
            <rect key={i} x={segment.xSpan.start} y={70} width={segment.xSpan.getLength()} height={10} fill={COLOR} />
        );
        return <React.Fragment key={i} >
            <line x1={xStart} y1={5} x2={xEnd} y2={5} stroke="darkblue" />
            <line x1={xStart} y1={75} x2={xEnd} y2={75} stroke={COLOR} />
            {targetRects}
            {queryRects}
        </React.Fragment>;
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
        let svgElements = null;
        if (alignment) {
            const drawFunction = alignment.isFineMode ? this.renderFineAlignment : this.renderMergedAlignment;
            svgElements = alignment.drawData.map(drawFunction);
        }

        return <Track
            {...this.props}
            visualizer={<svg width={width} height={HEIGHT} style={{display: "block"}} >{svgElements}</svg>}
            legend={<TrackLegend trackModel={trackModel} height={HEIGHT} />}
        />
    }
}
