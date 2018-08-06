/**
 * Utilities that deal with processing of alignment strings
 * 
 * @author Silas Hsu
 */
import _ from 'lodash';

export const GAP_CHAR = '-';

/**
 * Counts the number of bases in a sequence, ignoring deletions and gaps.
 * 
 * @param {string} sequence - sequence to examine
 * @return {number} the number of bases in the sequence
 */
export function countBases(sequence: string): number {
    return _.sumBy(sequence, char => char === GAP_CHAR ? 0 : 1);
}

export interface SequenceSegment {
    /**
     * Whether the segment represents a gap
     */
    isGap: boolean;

    /**
     * The character index in the original sequence string
     */
    index: number;
    
    /**
     * The length of the segment in characters
     */
    length: number;
}

export function segmentSequence(sequence: string, minGapLength: number, onlyGaps=false): SequenceSegment[] {
    const results: SequenceSegment[] = [];
    const gapRegex = new RegExp(GAP_CHAR + '+', 'g'); // One or more '-' chars
    let match;
    while (match = gapRegex.exec(sequence)) { // Find gaps with the regex
        pushSegment(true, match.index, match[0].length, minGapLength);
    }
    if (onlyGaps) {
        return results;
    }

    // Derive non-gaps from the gaps
    let currIndex = 0;
    const gaps = results.slice();
    for (const gap of gaps) {
        pushSegment(false, currIndex, gap.index - currIndex);
        currIndex = gap.index + gap.length;
    }
    // Final segment between the last gap and the end of the sequence
    pushSegment(false, currIndex, sequence.length - currIndex);

    return results;

    function pushSegment(isGap: boolean, index: number, length: number, minLength: number=0) {
        if (length > minLength) {
            results.push({ isGap, index, length });
        }
    }
}

/**
 * Makes a mapping from string index to base numbers.
 * 
 * @param {string} sequence - the sequence to examine
 * @param {number} baseAtStart - the base number corresponding to the start of the string to iterate
 * @return {number[]}
 */
export function makeBaseNumberLookup(sequence: string, baseAtStart: number): number[] {
   const bases = [];
   let currentBase = baseAtStart;
   for (const char of sequence) {
       bases.push(currentBase);
       if (char !== GAP_CHAR) {
           currentBase++;
       }
   }
   return bases;
}

/**
 * An iterator that steps along a string, skipping '-' characters.  Instances start at index -1.
 * 
 * @author Silas Hsu
 */
export class AlignmentIterator {
    public sequence: string;
    private _currentIndex: number;

    /**
     * Constructs a new instance that iterates through the specified string.
     * 
     * @param {string} sequence - the string through which to iterate
     */
    constructor(sequence: string) {
        this.sequence = sequence;
        this._currentIndex = -1;
    }

    /**
     * Resets this instance's index pointer to the beginning of the string
     */
    reset(): void {
        this._currentIndex = -1;
    }

    /**
     * @return {number} the current index pointer
     */
    getCurrentIndex(): number {
        return this._currentIndex;
    }

    /**
     * Advances the index pointer and returns it.  If there is no valid base, the return value will be past the end of
     * the string.
     * 
     * @return {number} the index of the next valid base
     */
    getIndexOfNextBase(): number {
        do {
            this._currentIndex++;
        } while (this.sequence.charAt(this._currentIndex) === GAP_CHAR);
        return this._currentIndex;
    }

    /**
     * @return {boolean} whether there is a next valid base
     */
    hasNextBase(): boolean {
        return this._currentIndex < this.sequence.length - 1;
    }

    /**
     * Equivalent to calling getIndexOfNextBase() n times.  Returns the last result.  A negative n will have no effect.
     * 
     * @param {number} n - the number of bases to advance
     * @return {number} the index pointer after advancement
     */
    advanceN(n: number): number {
        let value = this._currentIndex;
        for (let i = 0; i < n; i++) {
            value = this.getIndexOfNextBase();
        }
        return value;
    }
}
