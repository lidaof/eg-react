import React from 'react';
import Track, { PropsFromTrackContainer } from './commonComponents/Track';
import TrackLegend from './commonComponents/TrackLegend';
import { Sequence } from '../Sequence';
import { ensureMaxListLength } from '../../util';
import { PlacedMergedAlignment, PlacedAlignment, PlacedSequenceSegment, GapText }
    from '../../model/alignment/AlignmentViewCalculator';
import AnnotationArrows from './commonComponents/annotation/AnnotationArrows';
import OpenInterval from '../../model/interval/OpenInterval';
import HoverTooltipContext from './commonComponents/tooltip/HoverTooltipContext';
import AlignmentSequence from './commonComponents/AlignmentCoordinates';
import HorizontalFragment from './commonComponents/HorizontalFragment';
import configOptionMerging from './commonComponents/configOptionMerging';

export const DEFAULT_OPTIONS = {
    height: 80,
    primaryColor: "darkblue",
    queryColor: "#B8008A",
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

// const FINE_MODE_HEIGHT = 80;
const ALIGN_TRACK_MARGIN = 20; // The margin on top and bottom of alignment block
// const ROUGH_MODE_HEIGHT = 80;
const RECT_HEIGHT = 15;
const TICK_MARGIN = 1;
const FONT_SIZE = 10;
// const PRIMARY_COLOR = 'darkblue';
// const QUERY_COLOR = '#B8008A';
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

class GenomeAlignTrackWithoutOptions extends React.Component<PropsFromTrackContainer> {
    constructor(props: PropsFromTrackContainer) {
        super(props);
        this.renderTooltip = this.renderTooltip.bind(this);
        this.renderGapText = this.renderGapText.bind(this);
        this.renderFineAlignment = this.renderFineAlignment.bind(this);
    }

    renderGapText(gap: GapText, i: number) {
        const { height, primaryColor, queryColor } = this.props.options;
        const placementTargetGap = gap.targetGapText;
        const placementQueryGap = gap.queryGapText;
        const placementGapX = (gap.targetTextXSpan.start + gap.targetTextXSpan.end) / 2;
        const queryPlacementGapX = (gap.queryTextXSpan.start + gap.queryTextXSpan.end) / 2;
        const shiftTargetText = gap.shiftTarget;
        const shiftQueryText = gap.shiftQuery;
        const targetY = shiftTargetText ? ALIGN_TRACK_MARGIN - 10 : ALIGN_TRACK_MARGIN + 5;
        const targetTickY = shiftTargetText ? ALIGN_TRACK_MARGIN - 5 : ALIGN_TRACK_MARGIN + 5;
        const queryY = shiftQueryText ? height - ALIGN_TRACK_MARGIN + 10 :
            height - ALIGN_TRACK_MARGIN - 5;
        const queryTickY = shiftQueryText ? height - ALIGN_TRACK_MARGIN + 5 :
            height - ALIGN_TRACK_MARGIN - 5;

        return <React.Fragment key={"gap " + i}>
            {renderLine(gap.targetXSpan.start, ALIGN_TRACK_MARGIN, gap.targetTextXSpan.start,
                targetTickY, primaryColor)}
            {renderText(placementTargetGap, placementGapX, targetY, primaryColor)}
            {renderLine(gap.targetXSpan.end, ALIGN_TRACK_MARGIN, gap.targetTextXSpan.end,
                targetTickY, primaryColor)}

            {renderLine(gap.queryXSpan.start, height - ALIGN_TRACK_MARGIN,
                gap.queryTextXSpan.start, queryTickY, queryColor)}
            {renderText(placementQueryGap, queryPlacementGapX, queryY, queryColor)}
            {renderLine(gap.queryXSpan.end, height - ALIGN_TRACK_MARGIN,
                gap.queryTextXSpan.end, queryTickY, queryColor)}
        </React.Fragment>

        function renderText(text: string, x: number, y: number, color: string) {
            return <text
                x={x}
                y={y}
                dominantBaseline="middle"
                style={{ textAnchor: "middle", fill: color, fontSize: 10 }}
            >
                {text}
            </text>;
        }

        function renderLine(x1: number, y1: number, x2: number, y2: number, color: string) {
            return <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
            />;

        }
    }

    renderFineAlignment(placement: PlacedAlignment, i: number) {
        const { height, primaryColor, queryColor } = this.props.options;
        const { targetXSpan, targetSegments, querySegments } = placement;
        const [xStart, xEnd] = targetXSpan;
        const targetSequence = placement.visiblePart.getTargetSequence();
        const querySequence = placement.visiblePart.getQuerySequence();
        const baseWidth = targetXSpan.getLength() / targetSequence.length;

        return <React.Fragment key={i} >
            {renderSequenceSegments(targetSequence, targetSegments, ALIGN_TRACK_MARGIN, primaryColor, false)}
            {renderAlignTicks()}
            {renderSequenceSegments(querySequence, querySegments, height - RECT_HEIGHT - ALIGN_TRACK_MARGIN,
                queryColor, true)}
        </React.Fragment>;

        function renderAlignTicks() {
            const ticks = [];
            let x = targetXSpan.start;
            for (i = 0; i < targetSequence.length; i++) {
                if (targetSequence.charAt(i).toUpperCase() === querySequence.charAt(i).toUpperCase()) {
                    ticks.push(
                        <line
                            key={i}
                            x1={x + baseWidth / 2}
                            y1={ALIGN_TRACK_MARGIN + RECT_HEIGHT + TICK_MARGIN}
                            x2={x + baseWidth / 2}
                            y2={height - ALIGN_TRACK_MARGIN - RECT_HEIGHT - TICK_MARGIN}
                            stroke="black"
                            strokeOpacity={0.7}
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
                    separation={baseWidth}
                />
            );

            return <React.Fragment>
                <line
                    x1={xStart + baseWidth / 4}
                    y1={y + 0.5 * RECT_HEIGHT}
                    x2={xEnd}
                    y2={y + 0.5 * RECT_HEIGHT}
                    stroke={color}
                    strokeDasharray={baseWidth / 2}
                />
                {rects}
                {isQuery && arrows}
                {letters}
            </React.Fragment>
        }
    }

    // Add arrow to query region, arrow direction is determined by plotReverse.
    renderRoughStrand(strand: string, topY: number, viewWindow: OpenInterval, isPrimary: boolean) {
        const plotReverse = strand === '-' ? true : false;
        return <AnnotationArrows
            key={"roughArrow" + viewWindow.start + isPrimary}
            startX={viewWindow.start}
            endX={viewWindow.end}
            y={topY}
            height={RECT_HEIGHT}
            opacity={0.75}
            isToRight={!plotReverse}
            color="white"
        />;
    }

    renderRoughAlignment(placement: PlacedMergedAlignment, 
            plotReverse: boolean, roughHeight: number) {
        const { queryFeature, queryXSpan, segments, targetXSpan } = placement;
        const queryRectTopY = roughHeight - RECT_HEIGHT;
        const targetGenomeRect = <rect
            x={targetXSpan.start}
            y={0}
            width={targetXSpan.getLength()}
            height={RECT_HEIGHT}
            fill={this.props.options.primaryColor}
            // tslint:disable-next-line:jsx-no-lambda
            onClick={() => alert("You clicked on " + queryFeature.getLocus().toString())}
        />;
        const queryGenomeRect = <rect
            x={queryXSpan.start}
            y={queryRectTopY}
            width={queryXSpan.getLength()}
            height={RECT_HEIGHT}
            fill={this.props.options.queryColor}
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
                [Math.floor(segment.targetXSpan.start), RECT_HEIGHT],
                [Math.floor(segment.queryXSpan.start), queryRectTopY],
                [Math.ceil(segment.queryXSpan.end), queryRectTopY],
                [Math.ceil(segment.targetXSpan.end), RECT_HEIGHT],
            ];
            if ((!plotReverse && segment.record.queryStrand === '-') ||
                (plotReverse && segment.record.queryStrand === '+')) {
                swap(points, 1, 2);
            }

            return <polygon
                key={i}
                points={points as any} // Contrary to what Typescript thinks, you CAN pass a number[][].
                fill={this.props.options.queryColor}
                fillOpacity={0.5}
                // tslint:disable-next-line:jsx-no-lambda
                onClick={() => alert("You clicked on " + segment.record.getLocus())}
            />;
        });

        return <React.Fragment key={queryFeature.getLocus().toString()} >
            {targetGenomeRect}
            {queryGenomeRect}
            {label}
            {ensureMaxListLength(segmentPolygons, MAX_POLYGONS)}
        </React.Fragment>
    }

    renderTooltip(relativeX: number) {
        const { alignment } = this.props;
        const { basesPerPixel, primaryGenome, queryGenome } = alignment;
        const drawData = alignment.drawData as PlacedAlignment[];

        // Which segment in drawData cusor lands on:
        const indexOfCusorSegment = drawData.reduce(
            (iCusor, x, i) => x.targetXSpan.start < relativeX && x.targetXSpan.end >= relativeX ? i : iCusor, NaN);
        const cusorSegment = drawData[indexOfCusorSegment];
        const sequenceHalfLength = 10; // The length of alignment in the hoverbox.

        return <AlignmentSequence
            alignment={cusorSegment}
            x={relativeX}
            halfLength={sequenceHalfLength}
            target={primaryGenome}
            query={queryGenome}
            basesPerPixel={basesPerPixel}
        />;
    }

    /** 
     * @inheritdoc
     */
    render() {
        const { width, trackModel, alignment, options, viewWindow } = this.props;
        const { height, queryColor, primaryColor } = options;
        let drawheight, svgElements = [];
        const hoverHeight = height - ALIGN_TRACK_MARGIN;
        let visualizer;
        if (!alignment) {
            drawheight = height;
            svgElements = null;
        } else if (alignment.isFineMode) {
            drawheight = height;
            const drawData = alignment.drawData as PlacedAlignment[];
            svgElements = drawData.map(this.renderFineAlignment);
            const drawGapText = alignment.drawGapText as GapText[];
            svgElements.push(...drawGapText.map(this.renderGapText));
            visualizer = <HoverTooltipContext tooltipRelativeY={hoverHeight} getTooltipContents={this.renderTooltip} >
                        <svg width={width} height={drawheight} style={{ display: "block" }} >{svgElements}</svg>
                    </HoverTooltipContext>;
        } else {
            drawheight = height;
            const drawData = alignment.drawData as PlacedMergedAlignment[];
            // const targetLocusArrayArray = drawData.map(
            //     placement => placement.segments.map(segment => segment.visiblePart.getLocus()));
            // const targetLocusArray = [].concat.apply([], targetLocusArrayArray);
            // const queryLocusArrayArray = drawData.map(
            //     placement => placement.segments.map(segment => segment.visiblePart.getQueryLocus()));
            // const queryLocusArray = [].concat.apply([], queryLocusArrayArray);
            const targetXSpanArrayArray = drawData.map(
                placement => placement.segments.map(segment => segment.targetXSpan));
            const targetXSpanArray = [].concat.apply([], targetXSpanArrayArray);
            const queryXSpanArrayArray = drawData.map(
                placement => placement.segments.map(segment => segment.queryXSpan));
            const queryXSpanArray = [].concat.apply([], queryXSpanArrayArray);
            const strand = alignment.plotStrand;
            svgElements = drawData.map(placement => 
                this.renderRoughAlignment(placement, strand === '-', height));
            const arrows = this.renderRoughStrand("+", 0, viewWindow, false);
            svgElements.push(arrows);
            const primaryViewWindow = alignment.primaryVisData.viewWindow;
            const primaryArrows = this.renderRoughStrand(strand, height - RECT_HEIGHT, primaryViewWindow, true);
            svgElements.push(primaryArrows);
            visualizer = <HorizontalFragment
                        height={height}
                        rectHeight={RECT_HEIGHT}
                        primaryColor={primaryColor}
                        queryColor={queryColor}
                        targetXSpanList={targetXSpanArray}
                        queryXSpanList={queryXSpanArray}>
                        <svg width={width} height={drawheight} style={{ display: "block" }} >{svgElements}</svg>
                    </HorizontalFragment>;
        }

        return <Track
            {...this.props}
            visualizer={visualizer}
            legend={<TrackLegend trackModel={trackModel} height={drawheight} />}
        />
    }
}

export const GenomeAlignTrack = withDefaultOptions(GenomeAlignTrackWithoutOptions);