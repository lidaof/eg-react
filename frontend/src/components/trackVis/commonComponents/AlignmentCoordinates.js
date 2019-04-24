import React from 'react';
import PropTypes from 'prop-types';

import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../../model/LinearDrawingModel'
import NavigationContext from '../../../model/NavigationContext';
import { segmentSequence, makeBaseNumberLookup, countBases, SequenceSegment } from '../../../model/alignment/AlignmentStringUtils.ts';
// import { PlacedAlignment } from '../../../model/alignment/AlignmentViewCalculator'

/**
 * Calculates genomic coordinates/sequences for both query and target alignment
 * at a page coordinate and displays them (using alignment segments).
 * 
 * @author Xiaoyu Zhuo
 */
export class AlignmentCoordinates extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        width: PropTypes.number.isRequired,
        x: PropTypes.number.isRequired,
        halfRange: PropTypes.number,
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {viewRegion, width, x, halfRange} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, width);
        if (this.props.halfRange) {
            const halfWidth = drawModel.basesToXWidth(this.props.halfRange);
            const segmentStart = drawModel.xToSegmentCoordinate(x - halfWidth);
            const segmentEnd = drawModel.xToSegmentCoordinate(x + halfWidth);
            const locusStart = segmentStart.getLocus();
            const locusEnd = segmentEnd.getLocus();
            const newRegion = viewRegion.setRegion(locusStart.start, locusEnd.start);
            console.log(newRegion);
            return `${locusStart.chr}:${Math.floor(locusStart.start)}-${Math.floor(locusEnd.start)}`;
        }
        else {
            const segment = drawModel.xToSegmentCoordinate(x);
            if (NavigationContext.isGapFeature(segment.feature)) {
                return segment.getName();
            } else {
                const locus = segment.getLocus();
                return `${locus.chr}:${Math.floor(locus.start)}`;
            }
        }
    }
}

export class AlignmentSequence extends React.Component {
    static propTypes = {
        alignment: PropTypes.object.isRequired,
        x: PropTypes.number.isRequired,
        halfLength: PropTypes.number.isRequired,
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {alignment, x, halfLength} = this.props;
        console.log(alignment);
        const {visiblePart, record} = alignment;
        const [start, end] = visiblePart.sequenceInterval;
        const cusorLocus = Math.round((x - alignment.targetXSpan.start)
            /(alignment.targetXSpan.end - alignment.targetXSpan.start)
            * (end - start));

        const cusorTargetSeq = record.targetSeq.substr(
            start + cusorLocus - halfLength, halfLength * 2 + 1);
        const cusorQuerySeq = record.querySeq.substr(
            start + cusorLocus - halfLength, halfLength * 2 + 1);
        const targetBaseLookup = makeBaseNumberLookup(visiblePart.getTargetSequence(),visiblePart.relativeStart);
        const targetStart = record.locus.start + visiblePart.relativeStart + targetBaseLookup[cusorLocus - halfLength];
        const targetEnd = record.locus.start + visiblePart.relativeStart + targetBaseLookup[cusorLocus + halfLength];
        const isReverse = record.getIsReverseStrandQuery();
        const queryLookupStart = isReverse ? visiblePart.relativeEnd : visiblePart.relativeStart;
        const queryBaseLookup = makeBaseNumberLookup(visiblePart.getQuerySequence(),queryLookupStart,isReverse);
        const queryStart = record.queryLocus.start + visiblePart.relativeStart + queryBaseLookup[cusorLocus - halfLength];
        const queryEnd = record.queryLocus.start + visiblePart.relativeStart + queryBaseLookup[cusorLocus + halfLength];
        const targetName = `${record.locus.chr}:${targetStart}-${targetEnd}`;
        const queryName = `${record.queryLocus.chr}:${queryStart}-${queryEnd}`;

        return <React.Fragment>
                <div>{targetName}</div>
                <div style={{fontFamily: "monospace",fontSize:16}}>{cusorTargetSeq}</div>
                <pre style={{fontFamily: "monospace",fontSize:16,display:"inline"}} >{"|||||||||  ||||||||||"}</pre>
                <div style={{fontFamily: "monospace",fontSize:16}}>{cusorQuerySeq}</div>
                <div>{queryName}</div>
            </React.Fragment>
    }
}
