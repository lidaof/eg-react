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
        super(
            rawObject.readName,
            new ChromosomeInterval(rawObject.segment, start, end),
            rawObject.flag & BamFlags.REVERSE_COMPLEMENT ? REVERSE_STRAND_CHAR : FORWARD_STRAND_CHAR
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
     * @return {Object} human-readable alignment of this record to the reference genome
     */
    getAlignment() {
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
                This works by doing a Cigar pass followd by an MD pass
                Ex:
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


        // First do an MD pass marking Deletions for indel
        const CIGAR_REGEX = /(\d+)([A-Z]|\^[A-Z]+)/g;
        /**
         * MD_REGEX can parse the following
         * 1G0^T4C1
         ^T4C1`
         6G4C20G1A5C5A1^C3A15G1G15
         10A5^AC6`
         */
        const MD_REGEX = /(\d+)([A-Z]|\^[A-Z]+)*/g;
        let result;
        let reference = '';
        let lines = '';
        let read = '';

        // read start and the reference start are different due to insertions
        let start = 0;
        let refStart = 0;
        while ((result = CIGAR_REGEX.exec(this.cigar)) !== null) {
            const [fullOp, countStr, operation] = result;
            const count = Number(countStr);
            switch (operation) {
                case 'M':
                    reference += this.seq.slice(refStart, refStart + count);
                    read += this.seq.slice(start, start + count);
                    lines += '|'.repeat(count);
                    break;
                case 'I':
                    read += this.seq.slice(start, start + count);
                    reference += '-'.repeat(count);
                    lines += ' '.repeat(count);
                    refStart += count;
                    break;
                case 'D':
                    reference += 'D'.repeat(count);
                    read += '-'.repeat(count);
                    lines += ' '.repeat(count);
                    break;
            }
            start += count;
            refStart += count;
        }
        // Next do an MD pass. Replacing deletions

        start = 0;
        refStart = 0;
        result = null;
        while ((result = MD_REGEX.exec(this.cigar)) !== null) {
            const [fullOp, countStr, operation] = result;
            /**
             * Handle various operations there are a couple of cases
             * ['1', undefined, index: 4] This comes at the end. This means there was 1 match
             * ['6G', '6', 'G'] 6 matches followed by a G sub
             * ['1^C, '1', '^C'] 1 match followed by a C sub
             */
            // Handle case where MD is at the end of the string such as MD = 10;
            if (!operation[1]) {
                // do nothing
                const count = Number(operation[0]);
                start += count;
                refStart += seek(reference, refStart, count);
                continue;

            } else if (operation[2] === '^') {
                // Handle case of deletion. The previous pass should have made the character a D
                const count = Number(countStr); // how many to skip ahead.
                start += count;
                refStart += seek(reference, refStart, count);
                const replacement = (operation[2] as string).slice(1);
                if (reference[refStart] !== 'D') { throw new Error('Implementation Error'); }
                reference = reference.substr(0, refStart) + replacement + reference.substr(refStart + replacement.length);

            } else {
                const count = Number(countStr);
                start += count;
                refStart += seek(reference, refStart, count);
                reference = reference.substr(0, refStart) + operation[2] + reference.substr(refStart + 1);
            }

        }

        return {
            reference,
            lines,
            read
        }


        /**
         * seek returns the number of elements between [start, start + amount] where 
         * amount ignores -
         * seek('a-b', 0, 1) returns 2
         *
         * @param {string} str
         * @param {number} start
         * @param {number} amount
         * @returns {number}
         */
        function seek(str: string, start: number, amount: number): number {
            let seen = 0;
            let valid = 0;
            while (valid !== amount) {
                do {
                    seen += 1;
                } while (str[start + seen] === '-');
                valid += 1;
            }
            return seen;
        }
    }
}

export default BamRecord;
