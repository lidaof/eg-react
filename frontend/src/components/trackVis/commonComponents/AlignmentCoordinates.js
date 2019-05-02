import React from 'react';
import PropTypes from 'prop-types';
import { makeBaseNumberLookup } from '../../../model/alignment/AlignmentStringUtils.ts';
import './tooltip/Tooltip.css'

/**
 * Calculates genomic coordinates/sequences for both query and target alignment
 * at a page coordinate and displays them in hover box (using alignment segments).
 * 
 * @author Xiaoyu Zhuo
 */

class AlignmentSequence extends React.Component {
    static propTypes = {
        alignment: PropTypes.object,
        x: PropTypes.number.isRequired,
        halfLength: PropTypes.number.isRequired,
        target: PropTypes.string.isRequired,
        query: PropTypes.string.isRequired,
        basesPerPixel: PropTypes.number.isRequired,
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {alignment, x, halfLength, target, query, basesPerPixel} = this.props;
        if (!alignment) {
            return <div>{"No alignment available"}</div>;
        }
        else {
            const highlightLength = Math.ceil(basesPerPixel);
            const halfHighlightLength = Math.floor(highlightLength/2);
            const {visiblePart, record} = alignment;
            const [start, end] = visiblePart.sequenceInterval;
            const length = end - start;
            const cusorLocus = Math.floor((x - alignment.targetXSpan.start)
                /(alignment.targetXSpan.end - alignment.targetXSpan.start)
                * length);
            const relativeDisplayStart = cusorLocus - halfLength > 0 ? cusorLocus - halfLength : 0;
            const relativeDisplayEnd = cusorLocus + halfLength < length ? cusorLocus + halfLength : (length - 1);
            const relativeHighlightStart = cusorLocus - halfHighlightLength > 0 ? cusorLocus - halfHighlightLength : 0;
            const relativeHighlightEnd = cusorLocus + halfHighlightLength < length ? cusorLocus + halfHighlightLength : (length - 1);


            const cusorTargetSeqLeft = record.targetSeq.substr(
                start + relativeDisplayStart, relativeHighlightStart - relativeDisplayStart).toUpperCase();
            const cusorTargetSeqMid = record.targetSeq.substr(start + relativeHighlightStart, highlightLength).toUpperCase();
            const cusorTargetSeqRight = record.targetSeq.substr(start + relativeHighlightEnd + 1, relativeDisplayEnd - relativeHighlightEnd).toUpperCase();

            const cusorQuerySeqLeft = record.querySeq.substr(
                start + relativeDisplayStart, relativeHighlightStart - relativeDisplayStart).toUpperCase();
            const cusorQuerySeqMid = record.querySeq.substr(start + relativeHighlightStart, highlightLength).toUpperCase();
            const cusorQuerySeqRight = record.querySeq.substr(
                start + relativeHighlightEnd + 1, relativeDisplayEnd - relativeHighlightEnd).toUpperCase();

            const targetBaseLookup = makeBaseNumberLookup(visiblePart.getTargetSequence(),visiblePart.relativeStart);
            const targetStart = record.locus.start + targetBaseLookup[relativeDisplayStart];
            const targetEnd = record.locus.start + targetBaseLookup[relativeDisplayEnd];
            const targetHighlightStart = record.locus.start + targetBaseLookup[relativeHighlightStart];
            const targetHighlightEnd = record.locus.start + targetBaseLookup[relativeHighlightEnd];
            const isReverse = record.getIsReverseStrandQuery();
            const queryLocus = visiblePart.getQueryLocusFine();
            const queryLookupStart = isReverse ? queryLocus.end : queryLocus.start;
            const queryBaseLookup = makeBaseNumberLookup(visiblePart.getQuerySequence(),queryLookupStart,isReverse);
            const queryStart = queryBaseLookup[relativeDisplayStart];
            const queryEnd = queryBaseLookup[relativeDisplayEnd];
            const queryHighlightStart = queryBaseLookup[relativeHighlightStart];
            const queryHighlightEnd = queryBaseLookup[relativeHighlightEnd];
            
            const maxTextLength = Math.max(targetStart.toString().length, targetEnd.toString().length, 
                                            queryStart.toString().length, queryEnd.toString().length);
            const displayPix = maxTextLength * 10 + 10 + "px";  // text width with font-size: 16px;
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
                    <div>
                        <span>{target}:{record.locus.chr}: </span>
                        <span className="Tooltip-highlight-text">{targetHighlightStart}-{targetHighlightEnd}</span>
                    </div>
                    <div>
                        <span className="Tooltip-monospace-text" style={{width: displayPix}}>{targetStart}</span>
                        <span className="Tooltip-monospace-seq" >{cusorTargetSeqLeft}</span>
                        <span className="Tooltip-monospace-central-seq">{cusorTargetSeqMid}</span>
                        <span className="Tooltip-monospace-seq" >{cusorTargetSeqRight}</span>
                        <span className="Tooltip-monospace-text" style={{width: displayPix}}>{targetEnd}</span>
                    </div>
                    <div>
                        <pre className="Tooltip-monospace-seq" style={{marginLeft: displayPix}}>{tickLeft}</pre>
                        <pre className="Tooltip-monospace-central-seq" >{tickMid}</pre>
                        <pre className="Tooltip-monospace-seq" >{tickRight}</pre>
                    </div>
                    <div>
                        <span className="Tooltip-monospace-text" style={{width: displayPix}}>{queryStart}</span>
                        <span className="Tooltip-monospace-seq" >{cusorQuerySeqLeft}</span>
                        <span className="Tooltip-monospace-central-seq" >{cusorQuerySeqMid}</span>
                        <span className="Tooltip-monospace-seq" >{cusorQuerySeqRight}</span>
                        <span className="Tooltip-monospace-text" style={{width: displayPix}}>{queryEnd}</span>
                    </div>
                    <div>
                        <span>{query}:{record.queryLocus.chr}: </span>
                        <span className="Tooltip-highlight-text">{queryHighlightStart}-{queryHighlightEnd}</span>
                    </div>
                </React.Fragment>
        }
    }
}

export default AlignmentSequence;
