import { FeatureSegment } from '../interval/FeatureSegment';
import { AlignmentRecord } from './AlignmentRecord';
import OpenInterval from '../interval/OpenInterval';
import ChromosomeInterval from '../interval/ChromosomeInterval';
import { countBases, AlignmentIterator } from './AlignmentStringUtils';

export class AlignmentSegment extends FeatureSegment {
    public readonly feature: AlignmentRecord;
    public readonly sequenceInterval: OpenInterval;

    static fromFeatureSegment(segment: FeatureSegment): AlignmentSegment {
        return new AlignmentSegment(segment.feature as AlignmentRecord, segment.relativeStart, segment.relativeEnd);
    }

    constructor(record: AlignmentRecord, start?: number, end?: number) {
        super(record, start, end);
        const alignIter = new AlignmentIterator(record.targetSeq);
        // +1 because AlignmentIterator starts on string index -1.
        const substringStart = alignIter.advanceN(this.relativeStart + 1);
        const substringEnd = alignIter.advanceN(this.getLength());
        this.sequenceInterval = new OpenInterval(substringStart, substringEnd);
    }

    getTargetSequence() {
        const [start, end] = this.sequenceInterval;
        return this.feature.targetSeq.substring(start, end);
    }

    getQueryLocus() {
        const {querySeq, queryLocus} = this.feature;
        // The sequence in the record "before" this sequence
        const baseOffset = countBases(querySeq.substring(0, this.sequenceInterval.start));
        const baseLength = countBases(this.getQuerySequence());

        if (this.feature.getIsReverseStrandQuery()) {
            const end = queryLocus.end - baseOffset;
            return new ChromosomeInterval(queryLocus.chr, end - baseLength, end);
        } else {
            const start = queryLocus.start + baseOffset;
            return new ChromosomeInterval(queryLocus.chr, start, start + baseLength);
        }
    }

    getQuerySequence() {
        const [start, end] = this.sequenceInterval;
        return this.feature.querySeq.substring(start, end);
    }
}
