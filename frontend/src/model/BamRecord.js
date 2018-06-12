import { Feature, REVERSE_STRAND_CHAR, FORWARD_STRAND_CHAR } from "./Feature";
import { BamFlags } from "../vendor/bbi-js/main/bam";
import ChromosomeInterval from "./interval/ChromosomeInterval";

/**
 * 
 * @param {string} cigarString 
 * @return {number} The number of bases the record spans in the reference genome
 */
function getNumReferenceBases(cigarString) {
    /*
    let cigarString = '1S22M98N25M';
    let operations = cigarString.split(/\d+/).slice(1) --> ['S', 'M', 'N', 'M']
    let opCounts = cigarString.split(/\D+/); --> ['1', '22', '98', '25', '']
    */
    let operations = cigarString.split(/\d+/).slice(1)
    let opCounts = cigarString.split(/\D+/);
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

class BamRecord extends Feature {
    static makeBamRecords(rawObjects) {
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
        let results = [];
        for (let rawObject of rawObjects) {
            if (rawObject.flag & BamFlags.SEGMENT_UNMAPPED || rawObject.flag & BamFlags.SUPPLEMENTARY) {
                continue;
            }
            results.push(new BamRecord(rawObject));
        }
        return results;
    }

    constructor(rawObject) {
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
        */
    }
}

export default BamRecord;
