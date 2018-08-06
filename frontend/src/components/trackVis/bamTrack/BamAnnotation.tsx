import React from 'react';
import { TranslatableG } from '../../TranslatableG';
import { FeaturePlacer, PlacedSegment, PlacedFeature } from '../../../model/FeaturePlacer';
import { BamRecord } from '../../../model/BamRecord';
import { AlignmentIterator } from '../../../model/alignment/AlignmentStringUtils';

const HEIGHT = 10;
const MIN_DRAW_WIDTH = 0.5 // Pixels
const FEATURE_PLACER = new FeaturePlacer();

export interface BamAnnotationOptions {
    color?: string;
    color2?: string;
    mismatchColor?: string;
    deletionColor?: string;
    insertionColor?: string;
}

interface BamAnnotationProps {
    placedRecord: PlacedFeature;
    options: BamAnnotationOptions;
    y?: number;
    onClick(event: React.MouseEvent, record: BamRecord): void;
}

/**
 * Draws a single BAM annotation.
 * 
 * @author Silas Hsu
 */
export class BamAnnotation extends React.Component<BamAnnotationProps, {}> {
    static HEIGHT = HEIGHT;

    static defaultProps = {
        options: {}
    };

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
        const {segment, xSpan} = placedSegment;
        const record = segment.feature as BamRecord;
        const options = this.props.options;
        // First, determine if we should draw this segment at all
        if (xSpan.getLength() < MIN_DRAW_WIDTH) {
            return null;
        }

        // A rect covering the entire segment
        const elements = [<rect
            key={segment.relativeStart}
            x={xSpan.start}
            y={0}
            width={xSpan.getLength()}
            height={HEIGHT}
            fill={ record.getIsForwardStrand() ? options.color : options.color2 }
        />];

        // Check if we should be drawing sequence mismatches/misalignments
        const widthOfOneBase = xSpan.getLength() / segment.getLength();
        if (widthOfOneBase < MIN_DRAW_WIDTH) {
            return elements; // No use drawing individual bases
        }

        const alignment = record.getAlignment();
        const referenceIter = new AlignmentIterator(alignment.reference);
        referenceIter.advanceN(segment.relativeStart);
        let alignIndex = referenceIter.getIndexOfNextBase();
        const maxIndex = alignIndex + segment.getLength();
        
        let x = xSpan.start;
        // For each base in the reference sequence...
        for (; alignIndex < maxIndex; alignIndex++, x += widthOfOneBase) {
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
                    x={x}
                    y={0}
                    width={widthOfOneBase}
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
        const xSpan = placedSegment.xSpan;
        if (xSpan.getLength() < MIN_DRAW_WIDTH) {
            return null;
        }

        const [x1, x2] = xSpan;
        const y = HEIGHT/2;
        return <line key={x1} x1={x1} y1={y} x2={x2} y2={y} stroke="grey" />;
    }

    handleClick(event: React.MouseEvent) {
        this.props.onClick(event, this.props.placedRecord.feature as BamRecord);
    }

    render() {
        const placedRecord = this.props.placedRecord;
        const record = this.props.placedRecord.feature as BamRecord;
        const segments = record.getSegments();
        const placedAligned = FEATURE_PLACER.placeFeatureSegments(placedRecord, segments.aligned);
        const placedSkipped = FEATURE_PLACER.placeFeatureSegments(placedRecord, segments.skipped);
        return <TranslatableG y={this.props.y} onClick={this.handleClick} >
            {placedSkipped.map(this.renderSkip)}
            {placedAligned.map(this.renderRead)}
        </TranslatableG>;
    }
}
