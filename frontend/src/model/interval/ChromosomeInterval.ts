import OpenInterval from './OpenInterval';
import _ from 'lodash';

/**
 * The plain-object version of ChromosomeInterval, without any methods.
 */
export interface IChromosomeInterval {
    chr: string; // Name of the chromosome
    start: number; // Start base number, inclusive
    end: number; // End base number, exclusive
}

/**
 * Return result from ChromsomeInterval.mergeAdvanced().
 * 
 * @template T - an object that can be converted into a ChromosomeInterval
 */
interface MergedLocus<T> {
    locus: ChromosomeInterval; // Merged locus that contains many smaller loci
    sources: T[]; // The objects that contributed to the locus
}

/**
 * Basically an OpenInterval with a chromosome's name.  Expresses genomic coordinates.
 * 
 * @implements {Serializable}
 * @author Silas Hsu
 */
class ChromosomeInterval extends OpenInterval implements IChromosomeInterval {
    /**
     * Parses a string representing a ChromosomeInterval, such as those produced by the toString() method.  Throws an
     * error if parsing fails.
     * 
     * @param {string} str - interval to parse
     * @return {ChromosomeInterval} parsed instance
     * @throws {RangeError} if parsing fails
     */
    static parse(str: string): ChromosomeInterval {
        const regexMatch = str.replace(/,/g, '').match(/([\w:]+)\W+(\d+)\W+(\d+)/);
        if (regexMatch) {
            const chr = regexMatch[1];
            const start = Number.parseInt(regexMatch[2], 10);
            const end = Number.parseInt(regexMatch[3], 10);
            return new ChromosomeInterval(chr, start, end);
        } else {
            throw new RangeError("Could not parse interval");
        }
    }

    /**
     * Merges chromosome intervals based on proximity and chromosome name.  Does not mutate any inputs.
     * 
     * This function accepts a list of objects of arbitrary type, as long a ChromosomeInterval can be extracted through
     * the `iteratee` callback.  The `mergeDistance` parameter expresses a distance in bases at which two loci are close
     * enough to warrant merging.
     * 
     * @param {T[]} objects - objects from which ChromosomeIntervals can be extracted
     * @param {number} mergeDistance - distance in bases at which two intervals are close enough to merge
     * @param {(object: T) => ChromosomeInterval} iteratee - callback that accepts an object and returns a locus
     * @return {object[]}
     */
    static mergeAdvanced<T>(objects: T[], mergeDistance: number,
        iteratee: (object: T) => ChromosomeInterval): Array<MergedLocus<T>>
    {
        const groupedByChromosome = _.groupBy(objects, obj => iteratee(obj).chr);
        const merged = [];
        for (const chrName in groupedByChromosome) {
            const objectsForChromosome = groupedByChromosome[chrName];
            objectsForChromosome.sort((a, b) => iteratee(a).start - iteratee(b).start);
            const loci = objectsForChromosome.map(iteratee);

            // Merge loci for this chromosome
            let mergeStartIndex = 0;
            while (mergeStartIndex < loci.length) {
                // Initialize a new merged locus
                const mergedStart = loci[mergeStartIndex].start;
                let mergedEnd = loci[mergeStartIndex].end;
                let mergeEndIndex = mergeStartIndex + 1;

                // Find the end of the merged locus
                while (mergeEndIndex < loci.length) {
                    const [start, end] = loci[mergeEndIndex];
                    // Found the end: this locus is far enough from the current merged locus
                    if (start - mergedEnd > mergeDistance) {
                        break;
                    // else this record should be merged into the current locus
                    } else if (end > mergedEnd) { // Update the end of the merged locus if necessary
                        mergedEnd = end;
                    }
                    mergeEndIndex++;
                }

                // Push a new merged locus
                merged.push({
                    locus: new ChromosomeInterval(chrName, mergedStart, mergedEnd),
                    sources: objectsForChromosome.slice(mergeStartIndex, mergeEndIndex)
                });
                mergeStartIndex = mergeEndIndex;
            }
        }

        return merged;
    }

    /**
     * Merges chromosome intervals based on proximity, by default 2000 bp.  Does not mutate any inputs.
     * 
     * @param {ChromosomeInterval[]} intervals - interval list to inspect for overlaps
     * @param {number} [mergeDistance] - distance in bases at which two intervals are close enough to merge
     * @return {ChromosomeInterval[]} - version of input list with intervals merged
     */
    static mergeOverlaps(intervals: ChromosomeInterval[], mergeDistance=2000): ChromosomeInterval[] {
        const mergeInfos = ChromosomeInterval.mergeAdvanced(intervals, mergeDistance, _.identity);
        return mergeInfos.map(info => info.locus);
    }

    /**
     * Makes a new instance.  The input interval should be a 0-indexed open one.
     * 
     * @param {string} chr - name of the chromosome
     * @param {number} start - start of the interval, inclusive
     * @param {number} end - end of the interval, exclusive
     */
    constructor(public chr: string, public start: number, public end: number) {
        super(start, end);
    }

    serialize(): IChromosomeInterval {
        return this;
    }

    static deserialize(object: IChromosomeInterval): ChromosomeInterval {
        return new ChromosomeInterval(object.chr, object.start, object.end);
    }

    /**
     * Enables the spread operator for ChromosomeIntervals.
     */
    *[Symbol.iterator] () {
        yield this.start;
        yield this.end;
    }

    /**
     * @return {number} the length of this interval in base pairs
     */
    getLength(): number {
        return this.end - this.start;
    }

    /**
     * Intersects this and another ChromosomeInterval, and returns the result in as a new ChromosomeInterval.  Returns
     * null if there is no intersection at all.
     * 
     * @param {ChromosomeInterval} other - other ChromosomeInterval to intersect
     * @return {ChromosomeInterval} intersection of this and the other interval, or null if none exists
     */
    getOverlap(other: ChromosomeInterval): ChromosomeInterval {
        if (this.chr !== other.chr) {
            return null
        } else {
            const overlap = this.toOpenInterval().getOverlap(other);
            return overlap ? new ChromosomeInterval(this.chr, overlap.start, overlap.end) : null;
        }
    }

    /**
     * @return {string} human-readable representation of this interval
     */
    toString(): string {
        return `${this.chr}:${this.start}-${this.end}`;
    }


    /**
     * @return {OpenInterval} an OpenInterval version of this instance.
     */
    toOpenInterval(): OpenInterval {
        return new OpenInterval(this.start, this.end);
    }

    /**
     * Interprets this and another interval as a multi-chromosome interval, with this being the start and the other
     * being the end.  Returns a human-readable representation of that interpretation.
     * 
     * @param {ChromosomeInterval} other - the "end" of the multi-chromosome interval
     * @return {string} a human-readable representation of a multi-chromosome interval
     */
    toStringWithOther(other: ChromosomeInterval): string {
        return `${this.chr}:${this.start}-${other.chr}:${other.end}`;
    }
}

export default ChromosomeInterval;
