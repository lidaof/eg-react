import BamRecord from '../BamRecord';
import { BamFlags } from "../../vendor/bbi-js/main/bam";
import ChromosomeInterval from '../interval/ChromosomeInterval';

describe('constructor', () => {
    const BASIC_OBJECT = {
        MD: "5",
        flag: 0,
        cigar: "5M",
        pos: 10,
        readName: "My bam record",
        segment: "chr7",
        seq: "ATCGC"
    };

    it('constructs correctly for a simple record', () => {
        const record = new BamRecord(BASIC_OBJECT);
        expect(record.getLocus()).toEqual(new ChromosomeInterval("chr7", 10, 15));
        expect(record.getName()).toEqual("My bam record");
        expect(record.getIsForwardStrand()).toBe(true);
        expect(record.MD).toBe(BASIC_OBJECT.MD);
        expect(record.cigar).toBe(BASIC_OBJECT.cigar);
        expect(record.seq).toBe(BASIC_OBJECT.seq);
    });

    it('detects reverse strand correctly', () => {
        const object1 = {...BASIC_OBJECT}; // Clone
        object1.flag = BamFlags.REVERSE_COMPLEMENT;
        const record1 = new BamRecord(object1);
        expect(record1.getIsReverseStrand()).toBe(true);

        const object2 = {...BASIC_OBJECT};
        object2.flag = BamFlags.REVERSE_COMPLEMENT + BamFlags.ALL_SEGMENTS_ALIGN;
        const record2 = new BamRecord(object2);
        expect(record2.getIsReverseStrand()).toBe(true);

        const object3 = {...BASIC_OBJECT};
        object3.flag = BamFlags.LAST_SEGMENT;
        const record3 = new BamRecord(object3);
        expect(record3.getIsReverseStrand()).toBe(false);
    });

});

describe('getAlignment()', () => {
    const BASIC_OBJECT = {
        MD: "10",
        flag: 0,
        cigar: "10M",
        pos: 10,
        readName: "My bam record",
        segment: "chr7",
        seq: "ATCGCATCGC" // ATCGC repeated twice
    };

    it('understands an alignment where everything is a match', () => {
        const record = new BamRecord(BASIC_OBJECT);
        expect(record.getAlignment()).toEqual({
            reference: "ATCGCATCGC",
            lines:     "||||||||||",
            read:      "ATCGCATCGC"
        });
    });

    it('understands an alignment with mismatches', () => {
        const object = {...BASIC_OBJECT};
        object.MD = "4G0G4"; // 4 match, G in reference, G in reference, 4 matches
        const record = new BamRecord(object);
        expect(record.getAlignment()).toEqual({
            reference: "ATCGGGTCGC",
            lines:     "||||  ||||",
            read:      "ATCGCATCGC"
        });
    });

    it('understands an alignment with insertions in the read', () => {
        const object = {...BASIC_OBJECT};
        object.cigar = "4M1I2M1I2M"; // 4 match, 1 insertion, 2 match, 1 insertion, 2 match
        const record = new BamRecord(object);
        expect(record.getAlignment()).toEqual({
            reference: "ATCG-AT-CG",
            lines:     "|||| || ||",
            read:      "ATCGCATCGC"
        });
    });

    it('understands an alignment with deletions in the read', () => {
        const object = {...BASIC_OBJECT};
        object.cigar = "4M2D6M";
        object.MD = "4^AC6";
        const record = new BamRecord(object);
        expect(record.getAlignment()).toEqual({
            reference: "ATCGACCATCGC",
            lines:     "||||  ||||||",
            read:      "ATCG--CATCGC"
        });
    });

    it('understands the alignment with combinations of everything', () => {
        const object = {...BASIC_OBJECT};
        object.cigar = "2M1I1D3M1I3M"; // 2 match, 1 insertion, 1 deletion, 3 match, 1 insertion, 3 match
        object.MD = "1G0^T4C1";
        const record = new BamRecord(object);
        expect(record.getAlignment()).toEqual({
            reference: "AG-TGAC-CCC",
            lines:     "|   ||| | |",
            read:      "ATC-GCATCGC"
        });
    })
});
