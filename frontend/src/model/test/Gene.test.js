import Gene from '../Gene';
import NavigationContext from '../NavigationContext';
import Feature from '../Feature';
import DisplayedRegionModel from '../DisplayedRegionModel';
import OpenInterval from '../interval/OpenInterval';
import ChromosomeInterval from '../interval/ChromosomeInterval';

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

it('constructs correctly', () => {
    let instance = new Gene(RECORD);
    expect(instance.getName()).toBe("My Gene");
    expect(instance.getLocus()).toEqual(new ChromosomeInterval("chr1", 0, 1000));
    expect(instance.getIsReverseStrand()).toBe(true);
    expect(instance.dbRecord).toBe(RECORD);
});

it('gets exons and utrs correctly', () => {
    let instance = new Gene(RECORD);
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

it('getAbsExons() works correctly', () => {
    const navContext = new NavigationContext("toy context", [
        new Feature("feature1", new ChromosomeInterval("chr1", 500, 1000))
    ]);
    // The gene's location in this navigation context should be the entire context, so we don't specify start and end
    const navContextLocation = new DisplayedRegionModel(navContext); 

    const instance = new Gene(RECORD);
    const result = instance.getAbsExons(navContextLocation);
    expect(result.absTranslated).toEqual([
        new OpenInterval(0, 100), // = chr1:500-600
        new OpenInterval(200, 300) // = chr1:700-800
    ]);
    expect(result.absUtrs).toEqual([
        new OpenInterval(300, 500) // = chr1:800-1000
    ]);
});
