import React from 'react';
import PropTypes from 'prop-types';
import { makeBaseNumberLookup } from '../../../model/alignment/AlignmentStringUtils.ts';

/**
 * Calculates genomic coordinates/sequences for both query and target alignment
 * at a page coordinate and displays them in hover box (using alignment segments).
 * 
 * @author Xiaoyu Zhuo
 */

class AlignmentSequence extends React.Component {
    static propTypes = {
        alignment: PropTypes.object.isRequired,
        x: PropTypes.number.isRequired,
        halfLength: PropTypes.number.isRequired,
        target: PropTypes.string.isRequired,
        query: PropTypes.string.isRequired,
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {alignment, x, halfLength, target, query} = this.props;
        const {visiblePart, record} = alignment;
        const [start, end] = visiblePart.sequenceInterval;
        const cusorLocus = Math.floor((x - alignment.targetXSpan.start)
            /(alignment.targetXSpan.end - alignment.targetXSpan.start)
            * (end - start));
        const relativeDisplayStart = cusorLocus - halfLength > 0 ? cusorLocus - halfLength : 0;
        const relativeDisplayEnd = cusorLocus + halfLength < (end - start) ? cusorLocus + halfLength : (end - start);

        const cusorTargetSeqLeft = record.targetSeq.substr(
            start + relativeDisplayStart, cusorLocus - relativeDisplayStart).toUpperCase();
        const cusorTargetSeqMid = record.targetSeq.substr(start + cusorLocus, 1).toUpperCase();
        const cusorTargetSeqRight = record.targetSeq.substr(start + cusorLocus + 1, relativeDisplayEnd - cusorLocus).toUpperCase();

        const cusorQuerySeqLeft = record.querySeq.substr(
            start + relativeDisplayStart, cusorLocus - relativeDisplayStart).toUpperCase();
        const cusorQuerySeqMid = record.querySeq.substr(start + cusorLocus, 1).toUpperCase();
        const cusorQuerySeqRight = record.querySeq.substr(
            start + cusorLocus + 1, relativeDisplayEnd - cusorLocus).toUpperCase();

        const targetBaseLookup = makeBaseNumberLookup(visiblePart.getTargetSequence(),visiblePart.relativeStart);
        const targetStart = record.locus.start + targetBaseLookup[relativeDisplayStart];
        const targetEnd = record.locus.start + targetBaseLookup[relativeDisplayEnd - 1];
        const isReverse = record.getIsReverseStrandQuery();
        const queryLocus = visiblePart.getQueryLocusFine();
        const queryLookupStart = isReverse ? queryLocus.end : queryLocus.start;
        const queryBaseLookup = makeBaseNumberLookup(visiblePart.getQuerySequence(),queryLookupStart,isReverse);
        const queryStart = queryBaseLookup[relativeDisplayStart];
        const queryEnd = queryBaseLookup[relativeDisplayEnd - 1];
        const targetName = `${target}:${record.locus.chr}:${targetStart}-${targetEnd}`;
        const queryName = `${query}:${record.queryLocus.chr}:${queryStart}-${queryEnd}`;

        const tickLeft = _getick(cusorTargetSeqLeft,cusorQuerySeqLeft);
        const tickMid = _getick(cusorTargetSeqMid,cusorQuerySeqMid);
        const tickRight = _getick(cusorTargetSeqRight,cusorQuerySeqRight);

        function _getick(targetSeq, querySeq) {
            const targetSeqArray = targetSeq.split("");
            const querySeqArray = querySeq.split("");
            const tickArray = targetSeqArray.map(function(char,i) {
                return char === querySeqArray[i] ? "|" : " ";
            })
            return tickArray.join("");
        }
        return <React.Fragment>
                <div>{targetName}</div>
                <div>
                    <span style={{fontFamily: "monospace",fontSize:16}}>{cusorTargetSeqLeft}</span>
                    <span style={{fontFamily: "monospace",fontSize:16,backgroundColor:"coral"}}>{cusorTargetSeqMid}</span>
                    <span style={{fontFamily: "monospace",fontSize:16}}>{cusorTargetSeqRight}</span>
                </div>
                <div>
                    <pre style={{fontFamily: "monospace",fontSize:16,display:"inline"}} >{tickLeft}</pre>
                    <pre style={{fontFamily: "monospace",fontSize:16,display:"inline",backgroundColor:"coral"}} >{tickMid}</pre>
                    <pre style={{fontFamily: "monospace",fontSize:16,display:"inline"}} >{tickRight}</pre>
                </div>
                <div>
                    <span style={{fontFamily: "monospace",fontSize:16}}>{cusorQuerySeqLeft}</span>
                    <span style={{fontFamily: "monospace",fontSize:16,backgroundColor:"coral"}}>{cusorQuerySeqMid}</span>
                    <span style={{fontFamily: "monospace",fontSize:16}}>{cusorQuerySeqRight}</span>
                </div>
                {/* <div style={{fontFamily: "monospace",fontSize:16}}>{cusorQuerySeq}</div> */}
                <div>{queryName}</div>
            </React.Fragment>
    }
}

export default AlignmentSequence;
