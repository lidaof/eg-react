import { FeatureSegment } from '../interval/FeatureSegment';
import { AlignmentRecord } from './AlignmentRecord';
import OpenInterval from '../interval/OpenInterval';
import ChromosomeInterval from '../interval/ChromosomeInterval';
import { countBases, AlignmentIterator } from './AlignmentStringUtils';

/**
 * A segment of an alignment record.  Has methods that get parts of the attached record's sequences and loci.
 * 
 * @author Silas Hsu
 */
export class AlignmentSegment extends FeatureSegment {
    public readonly feature: AlignmentRecord;
    /**
     * The substring indices in the record's sequence data that this segment covers.
     */
    public readonly sequenceInterval: OpenInterval;

    /**
     * Creates an AlignmentSegment from a FeatureSegment whose attached feature is an AlignmentRecord.  Works almost
     * like a cast from FeatureSegment to AlignmentSegment.
     * 
     * @param {FeatureSegment} segment - a FeatureSegment whose attached feature must be an AlignmentRecord
     * @return {AlignmentSegment} a new AlignmentSegment from the data in the input
     */
    static fromFeatureSegment(segment: FeatureSegment): AlignmentSegment {
        return new AlignmentSegment(segment.feature as AlignmentRecord, segment.relativeStart, segment.relativeEnd);
    }

    /**
     * Constructs a new instance.
     * 
     * @see {FeatureSegment}
     */
    constructor(record: AlignmentRecord, start?: number, end?: number) {
        super(record, start, end);
        const alignIter = new AlignmentIterator(record.targetSeq);
        // +1 because AlignmentIterator starts on string index -1.
        const substringStart = alignIter.advanceN(this.relativeStart + 1);
        const substringEnd = alignIter.advanceN(this.getLength());
        this.sequenceInterval = new OpenInterval(substringStart, substringEnd);
    }

    /**
     * @return {string} the part of the primary genome sequence that this segment covers
     */
    getTargetSequence() {
        const [start, end] = this.sequenceInterval;
        return this.feature.targetSeq.substring(start, end);
    }

    /**
     * Gets the approximate location in the query/secondary genome that this segment covers.
     * 
     * @return {ChromosomeInterval} the approximate locus in the query/secondary genome represented by this segment.
     */
    getQueryLocus() {
        const queryLocus = this.feature.queryLocus;
        return new ChromosomeInterval(
            queryLocus.chr,
            queryLocus.start + this.relativeStart,
            queryLocus.end + this.relativeStart
        );
    }

    /**
     * Gets the location in the query/secondary genome that this segment covers.  Unlike `getQueryLocus`, this method
     * uses sequence data, so it will be more accurate, but also somewhat slower.
     * 
     * @return {ChromosomeInterval} the locus in the query/secondary genome represented by this segment.
     */
    getQueryLocusFine() {
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

    /**
     * @return {string} the part of the query/secondary genome sequence that this segment covers
     */
    getQuerySequence() {
        const [start, end] = this.sequenceInterval;
        return this.feature.querySeq.substring(start, end);
    }
}
