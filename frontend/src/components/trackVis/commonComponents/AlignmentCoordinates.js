import React from 'react';
import PropTypes from 'prop-types';

import DisplayedRegionModel from '../../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../../model/LinearDrawingModel'
import NavigationContext from '../../../model/NavigationContext';
import { makeBaseNumberLookup } from '../../../model/alignment/AlignmentStringUtils.ts';
// import { PlacedAlignment } from '../../../model/alignment/AlignmentViewCalculator'

/**
 * Calculates genomic coordinates/sequences for both query and target alignment
 * at a page coordinate and displays them (using alignment segments).
 * 
 * @author Xiaoyu Zhuo
 */

class AlignmentSequence extends React.Component {
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
        const {visiblePart, record} = alignment;
        const [start, end] = visiblePart.sequenceInterval;
        const cusorLocus = Math.floor((x - alignment.targetXSpan.start)
            /(alignment.targetXSpan.end - alignment.targetXSpan.start)
            * (end - start));
        const relativeDisplayStart = cusorLocus - halfLength > 0 ? cusorLocus - halfLength : 0;
        const relativeDisplayEnd = cusorLocus + halfLength < (end - start) ? cusorLocus + halfLength : (end - start);
        const cusorTargetSeq = record.targetSeq.substr(
            start + relativeDisplayStart, relativeDisplayEnd - relativeDisplayStart).toUpperCase();
        const cusorQuerySeq = record.querySeq.substr(
            start + relativeDisplayStart, relativeDisplayEnd - relativeDisplayStart).toUpperCase();

        const targetBaseLookup = makeBaseNumberLookup(visiblePart.getTargetSequence(),visiblePart.relativeStart);
        const targetStart = record.locus.start + targetBaseLookup[relativeDisplayStart];
        const targetEnd = record.locus.start + targetBaseLookup[relativeDisplayEnd - 1];
        const isReverse = record.getIsReverseStrandQuery();
        const queryLocus = visiblePart.getQueryLocusFine();
        const queryLookupStart = isReverse ? queryLocus.end : queryLocus.start;
        const queryBaseLookup = makeBaseNumberLookup(visiblePart.getQuerySequence(),queryLookupStart,isReverse);
        const queryStart = queryBaseLookup[relativeDisplayStart];
        const queryEnd = queryBaseLookup[relativeDisplayEnd - 1];
        const targetName = `${record.locus.chr}:${targetStart}-${targetEnd}`;
        const queryName = `${record.queryLocus.chr}:${queryStart}-${queryEnd}`;
        const targetSeqArray = cusorTargetSeq.split("");
        const querySeqArray = cusorQuerySeq.split("");
        const tickArray = targetSeqArray.map(function(char,i) {
            return char === querySeqArray[i] ? "|" : " ";
        })
        const tick = tickArray.join("");

        return <React.Fragment>
                <div>{targetName}</div>
                <div style={{fontFamily: "monospace",fontSize:16}}>{cusorTargetSeq}</div>
                <pre style={{fontFamily: "monospace",fontSize:16,display:"inline"}} >{tick}</pre>
                <div style={{fontFamily: "monospace",fontSize:16}}>{cusorQuerySeq}</div>
                <div>{queryName}</div>
            </React.Fragment>
    }
}

export default AlignmentSequence;
