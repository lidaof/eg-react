import React from 'react';
import TranslatableG from '../../TranslatableG';
import { FeaturePlacer, PlacedSegment } from '../../../model/FeaturePlacer';
import { AlignmentIterator, BamRecord } from '../../../model/BamRecord';
import NavigationContext from '../../../model/NavigationContext';
import LinearDrawingModel from '../../../model/LinearDrawingModel';
import OpenInterval from '../../../model/interval/OpenInterval';

const HEIGHT = 10;
const MIN_DRAW_WIDTH = 0.5 // Pixels
const FEATURE_PLACER = new FeaturePlacer();

interface BamAnnotationProps {
    record: BamRecord;
    navContext: NavigationContext;
    contextLocation: OpenInterval;
    drawModel: LinearDrawingModel;
    y: number;
    options: {
        color: string;
        color2: string;
        mismatchColor: string;
        deletionColor: string;
        insertionColor: string;
    };
    onClick(event: MouseEvent, record: BamRecord): void;
}

/**
 * Draws a single BAM annotation.
 * 
 * @author Silas Hsu
 */
export class BamAnnotation extends React.Component<BamAnnotationProps, {}> {
    static HEIGHT = HEIGHT;

    constructor(props: BamAnnotationProps) {
        super(props);
        this.renderRead = this.renderRead.bind(this);
        this.renderSkip = this.renderSkip.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    /**
     * Renders a segment representing an aligned portion of a BAM read.
     * 
     * @param {PlacedSegment} placedSegment - the segment to render, and placement info
     * @return {JSX.Element[]} the elements to render
     */
    renderRead(placedSegment: PlacedSegment) {
        const {segment, contextLocation, offsetRelativeToFeature} = placedSegment;
        const {record, drawModel, options} = this.props;
        // First, determine if we should draw this segment at all
        const width = drawModel.basesToXWidth(segment.getLength());
        if (width < MIN_DRAW_WIDTH) {
            return null;
        }

        // A rect covering the entire segment
        const elements = [<rect
            key={segment.relativeStart}
            x={drawModel.baseToX(contextLocation.start)}
            y={0}
            width={width}
            height={HEIGHT}
            fill={ record.getIsForwardStrand() ? options.color : options.color2 }
        />];

        // Check if we should be drawing sequence mismatches/misalignments
        const widthOfOneBase = drawModel.basesToXWidth(1)
        if (widthOfOneBase < MIN_DRAW_WIDTH) {
            return elements; // No use drawing individual bases
        }

        const alignment = record.getAlignment();
        const referenceIter = new AlignmentIterator(alignment.reference);
        referenceIter.advanceN(offsetRelativeToFeature);
        let alignIndex = referenceIter.getIndexOfNextBase();
        // For each base in the reference sequence...
        for (let i = 0; i < contextLocation.getLength(); i++, alignIndex++) {
            if (alignment.reference.charAt(alignIndex) === alignment.read.charAt(alignIndex)) {
                // Sequence match; do nothing
                continue;
            }

            if (alignment.reference.charAt(alignIndex) === '-') { // Insertion: no base in reference
                // TODO
            } else { // Base in reference exists: deletion or mismatch
                // color = no info in the read ? deletion : sequence mismatch
                const color = alignment.read.charAt(alignIndex) === '-' ? options.deletionColor : options.mismatchColor;
                elements.push(<rect
                    key={'mismatch' + alignIndex}
                    x={drawModel.baseToX(contextLocation.start + i)}
                    y={0} width={widthOfOneBase}
                    height={HEIGHT}
                    fill={color}
                />);
            }
        }
        return elements;
    }

    /**
     * Renders a segment representing a skipped portion of a BAM read.
     * 
     * @param {PlacedSegment} placedSegment - the segment to render, and placement info
     * @return {JSX.Element} the element to render
     */
    renderSkip(placedSegment: PlacedSegment) {
        const {segment, contextLocation} = placedSegment;
        // contextLocation is the segment's context location, not to be confused with `this.props.contextLocation`,
        // which is the location of the BamRecord.
        const drawModel = this.props.drawModel;
        const length = drawModel.basesToXWidth(segment.getLength());
        if (length < MIN_DRAW_WIDTH) {
            return null;
        }

        const x1 = drawModel.baseToX(contextLocation.start);
        const y = HEIGHT/2;
        return <line key={x1} x1={x1} y1={y} x2={x1 + length} y2={y} stroke="grey" />;
    }

    handleClick(event: MouseEvent) {
        this.props.onClick(event, this.props.record);
    }

    render() {
        const {record, navContext, contextLocation} = this.props;
        const segments = record.getSegments();
        const placedAligned = FEATURE_PLACER.placeFeatureSegments(segments.aligned, navContext, contextLocation);
        const placedSkipped = FEATURE_PLACER.placeFeatureSegments(segments.skipped, navContext, contextLocation);
        return <TranslatableG y={this.props.y} onClick={this.handleClick} >
            {placedSkipped.map(this.renderSkip)}
            {placedAligned.map(this.renderRead)}
        </TranslatableG>
    }
}
