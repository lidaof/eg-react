import React from 'react';
import Track, { PropsFromTrackContainer } from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';
import { Sequence } from '../Sequence';
import { ensureMaxListLength, niceBpCount } from '../../util';
import { PlacedMergedAlignment, PlacedAlignment, PlacedSequenceSegment }
    from '../../model/alignment/AlignmentViewCalculator';
import AnnotationArrows from './commonComponents/annotation/AnnotationArrows';
// import HoverTooltipContext from './commonComponents/tooltip/HoverTooltipContext';

const FINE_MODE_HEIGHT = 80;
const ALIGN_TRACK_MARGIN = 20; // The margin on top and bottom of alignment block
const ROUGH_MODE_HEIGHT = 80;
const RECT_HEIGHT = 15;
const TICK_HEIGHT = 10;
const FONT_SIZE = 10;
const PRIMARY_COLOR = 'darkblue';
const QUERY_COLOR = '#B8008A';
const MAX_POLYGONS = 500;

/**
 * Swaps two elements of an array, mutating it
 * 
 * @param {any[]} array - array to modify
 * @param {number} i - first index to swap
 * @param {number} j - second index to swap
 */
function swap(array: any[], i: number, j: number) {
    const temp = array[j];
    array[j] = array[i];
    array[i] = temp;
}

/**
 * 
 * @author Xiaoyu Zhuo
 * @author Daofeng Li
 * @author Silas Hsu
 */

export class GenomeAlignTrack extends React.Component<PropsFromTrackContainer> {
    constructor(props: PropsFromTrackContainer) {
        super(props);
        this.renderFineAlignment = this.renderFineAlignment.bind(this);
    }

    renderFineAlignment(lastPlacement: PlacedAlignment, placement: PlacedAlignment, i: number) {
        const {targetXSpan, targetSegments, querySegments} = placement;
        const [xStart, xEnd] = targetXSpan;
        const targetSequence = placement.visiblePart.getTargetSequence();
        const querySequence = placement.visiblePart.getQuerySequence();

        return <React.Fragment key={i} >
                {renderSequenceSegments(targetSequence, targetSegments, ALIGN_TRACK_MARGIN, PRIMARY_COLOR, false)}
                {i > 0 && renderPlacementGaps(lastPlacement, placement)}
                {renderAlignTicks(FINE_MODE_HEIGHT / 2, TICK_HEIGHT)}
                {renderSequenceSegments(querySequence, querySegments, FINE_MODE_HEIGHT-RECT_HEIGHT-ALIGN_TRACK_MARGIN, 
                    QUERY_COLOR, true)}
            </React.Fragment>;
        
        function renderPlacementGaps(lastPlacement: PlacedAlignment, placement: PlacedAlignment){
            const lastXEnd = lastPlacement.targetXSpan.end;
            const xStart = placement.targetXSpan.start;
            const lastTargetChr = lastPlacement.record.locus.chr;
            const lastTargetEnd = lastPlacement.record.locus.end;
            const lastQueryChr = lastPlacement.record.queryLocus.chr;
            const lastStrand = lastPlacement.record.queryStrand;
            const lastQueryEnd = 
                lastStrand === "+" ? lastPlacement.record.queryLocus.end : lastPlacement.record.queryLocus.start;
            const targetChr = placement.record.locus.chr;
            const targetStart = placement.record.locus.start;
            const queryChr = placement.record.queryLocus.chr;
            const queryStrand = placement.record.queryStrand;
            const queryStart = 
                queryStrand === "+" ? placement.record.queryLocus.start : placement.record.queryLocus.end;
            let placementQueryGap: string;
            if (lastQueryChr === queryChr){
                if (lastStrand === "+" && queryStrand === "+") {
                    placementQueryGap = queryStart >= lastQueryEnd ? "" : "overlap ";
                    placementQueryGap += niceBpCount(Math.abs(queryStart - lastQueryEnd));

                }
                else if (lastStrand === "-" && queryStrand === "-") {
                    placementQueryGap = lastQueryEnd >= queryStart ? "" : "overlap ";
                    placementQueryGap += niceBpCount(Math.abs(lastQueryEnd - queryStart));
                }
                else {
                    placementQueryGap = "reverse direction";
                }
            } else {
                placementQueryGap = "not connected";
            }
            const placementGapX = (lastXEnd + xStart) / 2;
            const queryPlacementGapX = (lastPlacement.queryXSpan.end + placement.queryXSpan.start) / 2
            const placementTargetGap = lastTargetChr === targetChr ? niceBpCount(targetStart - lastTargetEnd) : "not connected";

            return <React.Fragment>
                <text
                    x={placementGapX}
                    y={ALIGN_TRACK_MARGIN - 10}
                    dominantBaseline="middle"
                    style={{textAnchor: "middle", fill: 'black', fontSize: 10}}
                    >
                    {placementTargetGap}
                </text>
                <text
                    x={queryPlacementGapX}
                    y={FINE_MODE_HEIGHT-ALIGN_TRACK_MARGIN + 10}
                    dominantBaseline="middle"
                    style={{textAnchor: "middle", fill: 'black', fontSize: 10}}
                    >
                    {placementQueryGap}
                </text>
            </React.Fragment>
        }

        function renderAlignTicks(y: number, height: number) {
            const baseWidth = targetXSpan.getLength() / targetSequence.length;
            const ticks = [];
            let x = targetXSpan.start;
            for( i=0; i<targetSequence.length; i++) {
                if( targetSequence.charAt(i).toUpperCase() === querySequence.charAt(i).toUpperCase()) {
                    ticks.push(
                        <line
                            key={i}
                            x1={x + baseWidth/2}
                            y1={y - 0.5 * height + 1}
                            x2={x + baseWidth/2}
                            y2={y + 0.5 * height - 1}
                            stroke="black"
                        />
                    );
                }
                x += baseWidth;
            }
            return ticks;
        }

        function renderSequenceSegments(sequence: string, segments: PlacedSequenceSegment[], y: number, color: string,
            isQuery: boolean) {
            const nonGaps = segments.filter(segment => !segment.isGap);
            const rects = nonGaps.map((segment, i) =>
                <rect
                    key={i}
                    x={segment.xSpan.start}
                    y={y}
                    width={segment.xSpan.getLength()}
                    height={RECT_HEIGHT}
                    fill={color}
                />
            );
            const letters = nonGaps.map((segment, i) =>
                <Sequence
                    key={i}
                    sequence={sequence.substr(segment.index, segment.length)}
                    xSpan={segment.xSpan}
                    y={y}
                    isDrawBackground={false}
                    height={RECT_HEIGHT}
                />
            );
            const arrows = nonGaps.map((segment, i) =>
                <AnnotationArrows
                    key={i}
                    startX={segment.xSpan.start}
                    endX={segment.xSpan.end}
                    y={y}
                    height={RECT_HEIGHT}
                    opacity={0.75}
                    isToRight={!placement.record.getIsReverseStrandQuery()}
                    color="white"
                />
            );

            return <React.Fragment>
                <line
                    x1={xStart}
                    y1={isQuery ? y + RECT_HEIGHT : y}
                    x2={xStart + 10}
                    y2={isQuery ? y + RECT_HEIGHT + 10 : y - 10}
                    stroke={color}
                />
                <line
                    x1={xStart}
                    y1={y + 0.5 * RECT_HEIGHT}
                    x2={xEnd}
                    y2={y + 0.5 * RECT_HEIGHT}
                    stroke={color}
                    strokeDasharray={4}
                />
                {rects}
                {isQuery && arrows}
                {letters}
                <line
                    x1={xEnd}
                    y1={isQuery ? y + RECT_HEIGHT : y}
                    x2={xEnd - 10}
                    y2={isQuery ? y + RECT_HEIGHT + 10 : y - 10}
                    stroke={color}
                />
            </React.Fragment>
        }
    }

    renderRoughAlignment(placement: PlacedMergedAlignment) {
        const {queryFeature, queryXSpan, segments} = placement;
        const queryRectTopY = ROUGH_MODE_HEIGHT - RECT_HEIGHT;
        const queryGenomeRect = <rect
            x={queryXSpan.start}
            y={queryRectTopY}
            width={queryXSpan.getLength()}
            height={RECT_HEIGHT}
            fill={QUERY_COLOR}
            // tslint:disable-next-line:jsx-no-lambda
            onClick={() => alert("You clicked on " + queryFeature.getLocus().toString())}
        />;

        const estimatedLabelWidth = queryFeature.toString().length * FONT_SIZE;
        let label = null;
        if (estimatedLabelWidth < queryXSpan.getLength()) {
            label = <text
                x={0.5 * (queryXSpan.start + queryXSpan.end)}
                y={queryRectTopY + 0.5 * RECT_HEIGHT}
                dominantBaseline="middle"
                textAnchor="middle"
                fill="white"
                fontSize={12}
            >
                {queryFeature.getLocus().toString()}
            </text>;
        }

        const segmentPolygons = segments.map((segment, i) => {
            const points = [
                [Math.floor(segment.targetXSpan.start), 0],
                [Math.floor(segment.queryXSpan.start), queryRectTopY],
                [Math.ceil(segment.queryXSpan.end), queryRectTopY],
                [Math.ceil(segment.targetXSpan.end), 0],
            ];
            if (segment.record.queryStrand === '-') {
                swap(points, 1, 2);
            }

            return <polygon
                key={i}
                points={points as any} // Contrary to what Typescript thinks, you CAN pass a number[][].
                fill={QUERY_COLOR}
                fillOpacity={0.5}
                // tslint:disable-next-line:jsx-no-lambda
                onClick={() => alert("You clicked on " + segment.record.getLocus())}
            />;
        });

        return <React.Fragment key={queryFeature.getLocus().toString()} >
            {queryGenomeRect}
            {label}
            {ensureMaxListLength(segmentPolygons, MAX_POLYGONS)}
        </React.Fragment>
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {width, trackModel, alignment} = this.props;
        let height, svgElements = [];
        if (!alignment) {
            height = FINE_MODE_HEIGHT;
            svgElements = null;
        } else if (alignment.isFineMode) {
            height = FINE_MODE_HEIGHT;
            const drawData = alignment.drawData as PlacedAlignment[];
            // svgElements = drawData.map(this.renderFineAlignment);
            if (drawData.length > 0) {
                svgElements.push(this.renderFineAlignment(drawData[0],drawData[0],0));
                for(let i=1; i<drawData.length; i++) {
                    const svg = this.renderFineAlignment(drawData[i-1],drawData[i],i);
                    svgElements.push(svg);
                }
            }
        } else {
            height = ROUGH_MODE_HEIGHT;
            const drawData = alignment.drawData as PlacedMergedAlignment[];
            svgElements = drawData.map(this.renderRoughAlignment);
        }

        return <Track
            {...this.props}
            visualizer={<svg width={width} height={height} style={{display: "block"}} >{svgElements}</svg>}
            legend={<TrackLegend trackModel={trackModel} height={height} />}
        />
    }
}
