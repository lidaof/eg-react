import { Feature, REVERSE_STRAND_CHAR, FORWARD_STRAND_CHAR } from "./Feature";
import { BamFlags } from "../vendor/bbi-js/main/bam";
import ChromosomeInterval from "./interval/ChromosomeInterval";

/**
 * Gets the number of reference bases in the alignment. How many bases of the 
 * reference sequence that this feature occupies
 * 
 * @param {string} cigarString 
 * @return {number} The number of bases the record spans in the reference genome
 */
function getNumReferenceBases(cigarString: string): number {
    /*
    let cigarString = '1S22M98N25M';
    let operations = cigarString.split(/\d+/).slice(1) --> ['S', 'M', 'N', 'M']
    let opCounts = cigarString.split(/\D+/); --> ['1', '22', '98', '25', '']
    */
    const operations = cigarString.split(/\d+/).slice(1)
    const opCounts = cigarString.split(/\D+/);
    opCounts.pop();
    let referenceBases = 0; // The number of bases the record spans in the reference genome
    for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        if (operation !== 'I' && operation !== 'S') {
            const count = Number.parseInt(opCounts[i], 10);
            if (Number.isSafeInteger(count)) {
                referenceBases += count;
            }
        }
    }
    return referenceBases;
}

/**
 * Bam record interface.
 * https://github.com/vsbuffalo/devnotes/wiki/The-MD-Tag-in-BAM-Files
 *
 * @interface IBamRecord
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


/**
 * Struct returned by the getAlignment function
 *
 * @interface AlignmentResult
 */
interface AlignmentResult {
    reference: string;
    read: string;
    lines: string;
}

class BamRecord extends Feature {
    static makeBamRecords(rawObjects: IBamRecord[]) {
        /*
        Expected raw object from bbi-js
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
        const results = [];
        for (const rawObject of rawObjects) {
            if (rawObject.flag & BamFlags.SEGMENT_UNMAPPED || rawObject.flag & BamFlags.SUPPLEMENTARY) {
                continue;
            }
            results.push(new BamRecord(rawObject));
        }
        return results;
    }

    MD: string;
    cigar: string;
    seq: string;

    constructor(rawObject: IBamRecord) {
        const start = rawObject.pos;
        const end = start + getNumReferenceBases(rawObject.cigar);
        const ci = new ChromosomeInterval(rawObject.segment, start, end);
        const strand = rawObject.flag & BamFlags.REVERSE_COMPLEMENT ? REVERSE_STRAND_CHAR : FORWARD_STRAND_CHAR;
        super(
            rawObject.readName,
            ci,
            strand
        );
        this.MD = rawObject.MD;
        this.cigar = rawObject.cigar;
        this.seq = rawObject.seq;
    }

    /**
     * Gets a human-readable alignment of this record to the reference genome.  Returns an object with keys `reference`,
     * which contains the reference sequence, potentially with gaps; `lines`, which contains those bases that match; and
     * `read`, the aligned sequence, potentially with gaps.  Example return object:
```
{
    reference: "AG-TGAC-CCC",
    lines:     "|   ||| | |",
    read:      "ATC-GCATCGC"
}
```
     * @return {AlignmentResult} human-readable alignment of this record to the reference genome
     */
    getAlignment(): AlignmentResult {
        // const MD_REGEX = /\d+(([A-Z]|\^[A-Z]+)\d+)*/; // From the SAM specification.
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
        
        From David:
            This works by doing a Cigar pass followd by an MD pass.  Example:
                cigar = "4M2D6M";
                MD = "4^AC6";
                ATCGCATCGC
                // Cigar
                AT-DGCA-CGC
                ATC-GCATCGC
                // MD
                AG-DGCA-CGC
                ATC-GCATCGC
        */
        let [reference, read] = this.cigarPass(this.cigar, this.seq);
        [reference, read] = this.mdPass(reference, read);

        return {
            reference,
            lines: reference.split('').map((c, i) => (c === read[i]) ? '|' : ' ').join(''),
            read
        };
    }

    /**
     *
     *
     * @param {string} reference
     * @param {string} read
     * @returns {[string, string]}
     */
    cigarPass(cigar: string, seq: string): [string, string] {
        // First do an MD pass marking Deletions for indel
        const CIGAR_REGEX = /(\d+)([A-Z]|=)/g;
        /**
         * MD_REGEX can parse the following
         * 1G0^T4C1
         * 6G4C20G1A5C5A1^C3A15G1G15
         * 10A5^AC6`
         */
        let result;
        let reference = '';
        let read = '';
        // Do a cigar pass and add insertions/deletions
        let start = 0;
        let refStart = 0;
        while ((result = CIGAR_REGEX.exec(cigar))) {
            const [fullOp, countStr, operation] = result;
            let count = Number(countStr);
            switch (operation) {
                case 'M':
                    reference += seq.slice(refStart, refStart + count);
                    read += seq.slice(start, start + count);
                    break;
                case 'I':
                    read += seq.slice(start, start + count);
                    reference += '-'.repeat(count);
                    break;
                case 'D':
                    reference += 'D'.repeat(count);
                    read += '-'.repeat(count);
                    count = 0;
                    break;
            }
            start += count;
            refStart += count;

        }
        return [reference, read];
    }


    /**
     * Takes a reference and read that was processed by a cigar pass, and applies the 
     * BedRecords MD to it.
     *
     * @param {string} reference
     * @param {string} read
     * @returns {[string, string]}
     */
    mdPass(reference: string, read: string): [string, string] {
        const MD_REGEX = /(\d+)([A-Z]|\^[A-Z]+)*/g;

        // Next do an MD pass. Replacing deletions with actual value
        const start = 0;
        let refStart = 0;
        let result = null;
        while ((result = MD_REGEX.exec(this.MD))) {
            const [fullOp, countStr, operation] = result;
            /**
             * For every md that passes, you have one of the following cases
             * 1: ['1', undefined, index: 4] This comes at the end. This means there was 1 match
             * 2: ['6G', '6', 'G'] 6 matches followed by a G sub
             * 3: ['1^C, '1', '^C'] 1 match followed by a C sub
             */
            if (!operation) {
                // Case 1: MD = 10 or we are at the end. skip to the end;
                const count = Number(countStr);
                refStart += countKnownBases(reference, refStart, count);
                continue;

            } else if (operation[0] === '^') {
                // Case 3: Deletion
                // Handle case of deletion. The previous pass should have made the character a D
                const count = Number(countStr); // how many to skip ahead.
                refStart += countKnownBases(reference, refStart, count);
                const replacement = (operation as string).slice(1);
                if (reference[refStart] !== 'D') {
                    throw new Error('Implementation Error');
                }
                reference = reference.substr(0, refStart) + replacement + reference.substr(refStart + replacement.length);
                refStart += countKnownBases(reference, refStart, replacement.length);
            } else {
                // Case 2: Some amount of matches with a substitution 
                const count = Number(countStr);
                refStart += countKnownBases(reference, refStart, count);
                reference = reference.substr(0, refStart) + operation + reference.substr(refStart + operation.length);
                refStart += countKnownBases(reference, refStart, operation.length);
            }
        }
        return [reference, read];

        /**
         * countKnownBases returns the number of elements between [start, start + amount] while ignoring "-" characters.
         * Example: countKnownBases('a-b', 0, 1) returns 2
         *
         * @param {string} str
         * @param {number} start
         * @param {number} amount
         * @returns {number}
         */
        function countKnownBases(str: string, start: number, amount: number): number {
            let seen = 0;
            let valid = 0;
            if (amount === 0) { return 0; }
            for (let i = start + 1; i < str.length && valid !== amount; i++) {
                seen += 1;
                if (str[i] === '-') { continue; }
                valid += 1;
            }

            return seen;
        }
    }

}

export default BamRecord;
