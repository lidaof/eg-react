import Gene from '../Gene';
import OpenInterval from '../interval/OpenInterval';
import ChromosomeInterval from '../interval/ChromosomeInterval';
import { Chromosome, Genome } from '../Genome';

const RECORD = {
    "_id": "5a6a4edfc019c4d5b606c0e8",
    "bin": 792,
    "name": "NR_037940",
    "chrom": "chr1",
    "strand": "-",
    "txStart": 0,
    "txEnd": 1000,
    "cdsStart": 200,
    "cdsEnd": 800,
    "exonCount": 3,
    "exonStarts": "0,400,700,",
    "exonEnds": "300,600,1000,",
    "score": 0,
    "name2": "My Gene",
    "cdsStartStat": "unk",
    "cdsEndStat": "unk",
    "exonFrames": "-1,-1,-1,"
};

test('constructs correctly', () => {
    let instance = new Gene(RECORD);
    expect(instance.getName()).toBe("My Gene");
    expect(instance.getLocus()).toEqual(new ChromosomeInterval("chr1", 0, 1000));
    expect(instance.getIsForwardStrand()).toBe(false);
    expect(instance.refGeneRecord).toBe(RECORD);
    expect(instance.translated).toEqual([
        new OpenInterval(200, 300),
        new OpenInterval(400, 600),
        new OpenInterval(700, 800)
    ]);
    expect(instance.utrs).toEqual([
        new OpenInterval(0, 200),
        new OpenInterval(800, 1000),
    ]);
});

test('getDetails() works correctly', () => {
    const OFFSET = 10;
    const CHR_LENGTH = 500;
    let instance = new Gene(RECORD);
    const genome = new Genome("toy genome", [
        new Chromosome("chr0 - just to add an offset of 10", OFFSET),
        new Chromosome("chr1", CHR_LENGTH) // !!! Shorter than the Gene !!!  We expect some exons to be missing in this case.
    ]);
    instance.computeNavContextCoordinates(genome.makeNavContext());
    expect(instance.absStart).toBe(OFFSET);
    expect(instance.absEnd).toBe(CHR_LENGTH + OFFSET);
    expect(instance.absTranslated).toEqual([
        new OpenInterval(200 + OFFSET, 300 + OFFSET),
        new OpenInterval(400 + OFFSET, CHR_LENGTH + OFFSET)
    ]);
    expect(instance.absUtrs).toEqual([
        new OpenInterval(OFFSET, 200 + OFFSET)
    ]);
});
