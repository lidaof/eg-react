import { Feature, REVERSE_STRAND_CHAR, FORWARD_STRAND_CHAR } from './Feature';
import { BamFlags } from '../vendor/bbi-js/main/bam';
import ChromosomeInterval from './interval/ChromosomeInterval';
import { FeatureSegment } from './interval/FeatureSegment';
import { AlignmentIterator } from './alignment/AlignmentStringUtils';

/**
* Shape of objects from bbi-js.
*/
interface IBamRecord {
    MD: string;
    NM: number;
    XA: number;
    cigar: string;
    flag: number;
    mq: number;
    pos: number;
    quals: string;
    readName: string;
    segment: string;
    seq: string;
}
/*
BamRecord {
    MD: "27",
    NM: 0,
    XA: 0,
    cigar: "27M",
    flag: 0,
    mq: 255,
    pos: 18360643,
    quals: "IIIIIIIIIIIIIIIIIIIIIIIIIII",
    readName: "Sti_22947383",
    segment: "chr7",
    seq: "ATCGCCATTTTTGTAGGCTACGTATTT"
}
*/

interface CigarOperation {
    opName: string,
    count: number
}
const CIGAR_REGEX = /\d+[MIDNSHP=X]/g;
/**
* Parses a CIGAR string, which contains read alignment info.  See page 6 of
* https://samtools.github.io/hts-specs/SAMv1.pdf
*
* @param {string} cigarString - CIGAR string to parse
* @return {CigarOperation[]} parsed CIGAR operations
*/
function parseCigar(cigarString: string): CigarOperation[] {
    const matches = cigarString.match(CIGAR_REGEX);
    return matches.map(match => {
        return {
            opName: match.charAt(match.length - 1),
            count: Number.parseInt(match, 10)
        }
    });
}

const REFERENCE_SEQ_ADVANCING_OPS = new Set(['M', 'D', 'N', '=', 'x']);
/**
* Gets the number of reference bases in an alignment.
*
* @param {CigarOperation[]} cigar - parsed CIGAR operations
* @return {number} The number of bases the alignment spans in the reference genome
*/
function getNumReferenceBases(cigar: CigarOperation[]): number {
    let bases = 0;
    for (const cigarOp of cigar) {
        if (REFERENCE_SEQ_ADVANCING_OPS.has(cigarOp.opName)) {
            bases += cigarOp.count;
        }
    }
    return bases;
}


/**
 * Struct returned by the getAlignment() method
 */
interface AlignmentResult {
    reference: string;
    lines: string;
    read: string;
}

/**
 * A BAM record.
 *
 * @author Silas Hsu
 * @author David Ayeke
 */
export class BamRecord extends Feature {
    /**
    * Makes BAM records out of an array of raw objects.  Skips those objects which have BAM flags UNMAPPED and
    * SUPPLEMENTARY set.
    *
    * @param {object} rawObjects - plain objects that contain BAM info
    * @return {BamRecord[]} BAM records from the objects
    */
    static makeBamRecords(rawObjects: IBamRecord[]) {
        const results = [];
        console.log(rawObjects)
        for (const rawObject of rawObjects) {
            if (rawObject.flag & BamFlags.SEGMENT_UNMAPPED || rawObject.flag & BamFlags.SUPPLEMENTARY) {
                continue;
            }
            results.push(new BamRecord(rawObject));
        }
        return results;
    }
    
    MD: string;
    cigar: CigarOperation[];
    seq: string;
    
    constructor(rawObject: IBamRecord) {
        const start = rawObject.pos;
        const parsedCigar = parseCigar(rawObject.cigar);
        const end = start + getNumReferenceBases(parsedCigar);
        const locus = new ChromosomeInterval(rawObject.segment, start, end);
        const strand = rawObject.flag & BamFlags.REVERSE_COMPLEMENT ? REVERSE_STRAND_CHAR : FORWARD_STRAND_CHAR;
        super(rawObject.readName, locus, strand);

        this.MD = rawObject.MD;
        this.cigar = parsedCigar;
        this.seq = rawObject.seq;
    }
    
    /**
    * Gets segments of the this instance that are aligned and skipped.  Returns an object with keys `aligned` and
    * `skipped`, which contain those segments as a list of FeatureSegment.
    *
    * @return {object}
    */
    getSegments() {
        const aligned: FeatureSegment[] = [];
        const skipped: FeatureSegment[] = [];
        
        // Compare op types, differentiating only between ops that skip and ops that don't.
        const opEquals = (op1: string, op2: string) => op1 === 'N' ? op2 === 'N' : op2 !== 'N';
        
        // Only consider cigar ops that advance the reference sequence
        const cigar = this.cigar.filter(op => REFERENCE_SEQ_ADVANCING_OPS.has(op.opName));
        let i = 0, currentOffset = 0;
        while (i < cigar.length) {
            const currentSegmentOp = cigar[i].opName;
            let currentSegmentLength = cigar[i].count;
            let j = i + 1; // Find the "end" of the current segment
            while (j < cigar.length && opEquals(currentSegmentOp, cigar[j].opName)) {
                currentSegmentLength += cigar[j].count;
                j++;
            }
            i = j;
            const listToPush = currentSegmentOp === 'N' ? skipped : aligned;
            listToPush.push(new FeatureSegment(this, currentOffset, currentOffset + currentSegmentLength));
            currentOffset += currentSegmentLength;
        }
        
        return {aligned, skipped};
    }
    
    /**
    * Gets a human-readable alignment of this record to the reference genome.  Returns an object with keys `reference`,
    * the reference sequence; `lines`, those bases that match; and `read`, the aligned sequence.  Sequences may have
    * gaps due to alignment; dashes represent these gaps.
    *
    * @example {
    *     reference: "AG-TGAC-CCC",
    *     lines:     "|   ||| | |",
    *     read:      "ATC-GCATCGC"
    * }
    * @return {AlignmentResult} human-readable alignment of this record to the reference genome
    * @author David Ayeke
    */
    getAlignment(): AlignmentResult {
        /*
        From https://samtools.github.io/hts-specs/SAMtags.pdf:
        The MD field aims to achieve SNP/indel calling without looking at the reference. For example, a string
        ‘10A5^AC6’ means from the leftmost reference base in the alignment, there are 10 matches followed
        by an A on the reference which is different from the aligned read base; the next 5 reference bases are
        matches followed by a 2bp deletion from the reference; the deleted sequence is AC; the last 6 bases are
        matches. The MD field ought to match the CIGAR string.
        
        From Silas Hsu:
        The MD string contains no information about insertions in the read.  An example: if cigar="5M1I5M" (5 match,
        1 insertion, 5 match), then a valid MD string is MD="10".  10 bases align to the reference, and the MD
        string does not mention the insertion at all.
        See also: https://github.com/vsbuffalo/devnotes/wiki/The-MD-Tag-in-BAM-Files

        From David:
        This works by doing a CIGAR pass followd by an MD pass.  See the respective methods for details.
        */
        const [alignedReference, read] = this._cigarPass();
        const reference = this._mdPass(alignedReference);
        
        return {
            reference,
            lines: reference.split('').map((char, i) => (char === read[i]) ? '|' : ' ').join(''),
            read
        };
    }
            
    /**
    * Uses this instance's CIGAR to produce an alignment.  Insertions and deletions will be expressed as dashes in the
    * reference and read sequences respectively.  This method only handles *alignment*; the reference sequence may be
    * incorrect and should be corrected by the `mdPass()` method.
    *
    * @example returnValue = [
    *     "AT--CGDDCG",
    *     "ATCGCG--CG"
    * ]
    *
    * @return {[string, string]} aligned reference and read sequence
    */
    _cigarPass() {
        let reference = '';
        let read = '';
        let seqIndex = 0;
        for (const cigarOp of this.cigar) {
            const count = cigarOp.count;
            switch (cigarOp.opName) {
                case 'M': // Alignment (but not necessarily sequence) matches
                case '=':
                case 'X':
                reference += this.seq.slice(seqIndex, seqIndex + count);
                read += this.seq.slice(seqIndex, seqIndex + count);
                seqIndex += count;
                break;
                case 'I': // Insertion
                reference += '-'.repeat(count);
                read += this.seq.slice(seqIndex, seqIndex + count);
                seqIndex += count;
                break;
                case 'D': // Deletion
                reference += 'D'.repeat(count);
                read += '-'.repeat(count);
                break; // Note that deletions don't advance the seq index
                default:
                ; // Do nothing
            }
        }
        return [reference, read];
    }

    /**
    * Using this instance's MD string, corrects the reference sequence from `cigarPass()`.
    *
    * @example mdPass("AT--CGDDCG"); // returns "AA--CGCGCG"
    * @param {string} reference - reference sequence from `cigarPass()`
    * @return {string} - reference sequence with bases corrected
    */
    _mdPass(reference: string): string {
        // const MD_REGEX = /\d+(([A-Z]|\^[A-Z]+)\d+)*/;
        /*
        * The MD regex is from the SAM specification at https://samtools.github.io/hts-specs/SAMtags.pdf
        * It only tells us if a MD string is valid, which is why it isn't used in the code.  But from it, we know MD
        * strings must start and end with a number.
        *
        * Example MD strings:
        *     1G0^T4C1
        *     6G4C20G1A5C5A1^C3A15G1G15
        *     10A5^AC6
        */
        const MD_REGEX = /(\d+)([A-Z]|\^[A-Z]+)/g;
        
        const referenceIter = new AlignmentIterator(reference);
        let matchResult = null;
        while (matchResult = MD_REGEX.exec(this.MD)) {
            const numMatchingBases = Number.parseInt(matchResult[1], 10);
            let unmatchingBases = matchResult[2];
            referenceIter.advanceN(numMatchingBases); // Skip matching sequence.  Nothing to do there.
            
            if (unmatchingBases.charAt(0) === '^') { // Deletion
                unmatchingBases = unmatchingBases.slice(1); // Ignore the caret
            }
            for (let i = 0; i < unmatchingBases.length; i++) {
                // If a deletion, we should only be replacing 'D' chars.  For simplicity, this assertion is omitted.
                reference = replacePortionOfString(
                    reference, referenceIter.getIndexOfNextBase(), unmatchingBases.charAt(i)
                );
            }
        }
        
        return reference;
        
        function replacePortionOfString(str: string, index: number, substitution: string) {
            return str.substring(0, index) + substitution + str.substring(index + substitution.length);
        }
    }
}
