import OpenInterval from "./OpenInterval";
import ChromosomeInterval from "./ChromosomeInterval";
import { Feature } from "../Feature";

/**
 * A 0-indexed open interval within a Feature.  Or, put another way, attaches an interval to a Feature.
 *
 * @author Silas Hsu
 * @see Feature
 */
export class FeatureSegment {
    public readonly relativeStart: number; // Start base of the interval, relative to the feature's start
    public readonly relativeEnd: number; // End base of the interval, relative to the feature's start

    /**
     * Makes a new instance, attaching a interval to a Feature.  If start and end are not provided, the interval
     * defaults to the entire length of the feature.  The start and end parameters should express a *0-indexed open
     * interval*.
     *
     * @param {Feature} feature - the interval's feature
     * @param {number} [start] - start base of the interval, relative to the feature's start
     * @param {number} [end] - end base of the interval, relative to the feature's start
     * @throws {RangeError} if end is before start or the interval lies outside the feature
     */
    constructor(public readonly feature: Feature, start: number = 0, end?: number) {
        if (end === undefined) {
            end = feature.getLength();
        }
        if (end < start) {
            throw new RangeError("End cannot be less than start");
        }
        this.feature = feature;
        this.relativeStart = start;
        this.relativeEnd = end;

        if (start < 0) {
            throw new RangeError(`Start base ${start} must be at least 0`);
        } else if (end > feature.getLength()) {
            throw new RangeError(`End base ${end} specifies a base past the end of the feature`);
        }
    }

    get start() {
        console.error("FeatureSegment has no prop `start`.  Use `relativeStart` instead.");
        return this.relativeStart;
    }

    get end() {
        console.error("FeatureSegment has no prop `end`.  Use `relativeEnd` instead.");
        return this.relativeEnd;
    }

    /**
     * @return {OpenInterval} new OpenInterval containing this segment's relative start and end.
     */
    toOpenInterval(): OpenInterval {
        return new OpenInterval(this.relativeStart, this.relativeEnd);
    }

    /**
     * @return {string} the attached feature's name
     */
    getName(): string {
        return this.feature.getName();
    }

    /**
     * @return {number} this interval's length
     */
    getLength(): number {
        return this.relativeEnd - this.relativeStart;
    }

    /**
     * @return {ChromosomeInterval} the genomic location that this segment covers
     */
    getLocus(): ChromosomeInterval {
        const featureLocus = this.feature.getLocus();
        return new ChromosomeInterval(
            featureLocus.chr,
            featureLocus.start + this.relativeStart,
            featureLocus.start + this.relativeEnd
        );
    }

    /**
     * Intersects this and another FeatureSegment, and returns the result as a new FeatureSegment.  Returns `null` if
     * the *segments' features are different* or if there is no overlap.
     *
     * @param {FeatureSegment} other - other FeatureSegment to intersect
     * @return {FeatureSegment} intersection of this segment and the other one, or null if none exists
     */
    getOverlap(other: FeatureSegment): FeatureSegment {
        if (this.feature !== other.feature) {
            return null;
        }

        const overlap = this.toOpenInterval().getOverlap(other.toOpenInterval());
        return overlap ? new FeatureSegment(this.feature, overlap.start, overlap.end) : null;
    }

    /**
     * Intersects this and a genome location, and returns the result as a new FeatureSegment using the same Feature
     * that is attached to this.  Returns null if the genome location does not intersect with this location at all.
     *
     * @param {ChromosomeInterval} chrInterval - input genome location
     * @return {FeatureSegment} intersection of this and the input genomic location
     */
    getGenomeOverlap(chrInterval: ChromosomeInterval): FeatureSegment {
        const featureLocus = this.feature.getLocus();
        const genomeLocation = this.getLocus();
        const overlap = genomeLocation.getOverlap(chrInterval);
        if (!overlap) {
            return null;
        }
        const relativeStart = overlap.start - featureLocus.start;
        const relativeEnd = overlap.end - featureLocus.start;
        return new FeatureSegment(this.feature, relativeStart, relativeEnd);
    }

    /**
     * @return {string} human-readable representation of this interval
     */
    toString(): string {
        // web 1 based
        return `${this.getName()}:${this.relativeStart + 1}-${this.relativeEnd}`;
    }

    /**
     * Interprets this and another interval as a multi-feature interval, with this being the start and the other being
     * the end.  Returns a human-readable representation of that interpretation.
     *
     * @param {FeatureSegment} other - the end of the multi-feature interval
     * @return {string} a human-readable representation of a multi-feature interval
     */
    toStringWithOther(other: FeatureSegment): string {
        // web 1 based
        return `${this.getName()}:${this.relativeStart + 1}-${other.getName()}:${other.relativeEnd}`;
    }
}
