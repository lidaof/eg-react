import React from 'react';
import ChromosomeInterval from '../../../model/interval/ChromosomeInterval';
import OpenInterval from '../../../model/interval/OpenInterval';

const HEIGHT = 10;

class AlignmentIterator {
    /**
     * 
     * @param {string} sequence 
     */
    constructor(sequence) {
        this.sequence = sequence;
        this.currentOffset = 0;
    }

    reset() {
        this.currentOffset = 0;
    }

    getNthKnownBaseIndex(n) {
        this.reset();
        for (let i = 0; i < n - 1; i++) {
            this.getNextBaseIndex();
        }
        return this.getNextBaseIndex();
    }

    getNextBaseIndex() {
        let i = this.currentOffset;
        while (i < this.sequence.length && this.sequence.charAt(i) === "-") {
            i++;
        }
        this.currentOffset = i + 1;
        return i;
    }
}

class BamAnnotation extends React.Component {
    getSegments() {
        const {record} = this.props;
        const chr = record.getLocus().chr;
        let drawSegments = [];
        let skipSegments = [];
        let segments = [];
        const operations = record.cigar.match(/[MIDNSHP=X]/g);
        const opCounts = record.cigar.match(/\d+/g).map(str => Number.parseInt(str, 10));
        const opEquals = (op1, op2) => op1 === "N" ? op2 === "N" : op2 !== "N";
        let i = 0;
        let currentOffset = 0;
        while (i < operations.length) {
            const thisSegmentOp = operations[i];
            let currentSegmentLength = 0;
            for (; i < operations.length && opEquals(thisSegmentOp, operations[i]); i++) {
                currentSegmentLength += opCounts[i];
            }

            const segment = new OpenInterval(currentOffset, currentOffset + currentSegmentLength);
            currentOffset += currentSegmentLength;
            if (thisSegmentOp === "N") {
                skipSegments.push(segment);
            } else {
                drawSegments.push(segment);
            }
        }
        return {
            skipSegments: skipSegments,
            drawSegments: drawSegments
        };
    }

    /**
     * 
     * @param {OpenInterval} contextInterval - location in nav context
     * @param {number} offset - offset from start of feature
     */
    renderRead(contextInterval, offset) {
        const { record, drawModel, options } = this.props.drawModel;
        const width = drawModel.basesToXWidth(contextInterval.getLength());
        if (width < 0.25) {
            return null;
        }
        let elements = [];
        elements.push(<rect
            x={drawModel.baseToX(contextInterval.start)}
            y={0}
            width={width}
            height={HEIGHT}
            fill={ record.getIsForwardStrand() ? options.color : options.color2 }
        />);

        if (drawModel.basesToXWidth(1) < 0.5) {
            return elements; // No use drawing individual bases
        }

        let iter = new AlignmentIterator(record.getAlignment().reference);
        let refStringIndex = iter.getNthKnownBaseIndex(offset);
        for (let base = 0; base < contextInterval.getLength(); base++) {
            if (aligned) {
                continue;
            } else if (mismatch) {
                // yello rect
            } else if (insertion) {
                // triangle?
            } else { // deletion
                // black rect
            }
        }
    }

    renderSkip(contextInterval) {
        return null;
    }

    render() {
        const {navContextLocation, drawModel, options} = this.props;
        const absLocation = navContextLocation.getAbsoluteRegion();
        const genomicLocation = navContextLocation.getGenomeIntervals()[0];

        const startX = Math.max(-1, drawModel.baseToX(absLocation.start));
        const endX = Math.min(drawModel.baseToX(absLocation.end), drawModel.getDrawWidth() + 1);

        if (endX - startX < 0) {
            return null;
        }

        return null;
    }
}

export default BamAnnotation;
