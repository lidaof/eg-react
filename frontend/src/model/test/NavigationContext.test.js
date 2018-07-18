import NavigationContext from '../NavigationContext';
import Feature from '../Feature';
import ChromosomeInterval from '../interval/ChromosomeInterval';
import OpenInterval from '../interval/OpenInterval';

const NAME = "Wow very genome";
const FEATURES = [
    new Feature("f1", new ChromosomeInterval("chr1", 0, 10)),
    new Feature("f2", new ChromosomeInterval("chr2", 0, 10)),
    new Feature("f3", new ChromosomeInterval("chr2", 5, 15)), // Note genomic overlap with feature 2!
];
const instance = new NavigationContext(NAME, FEATURES);

describe("constructor", () => {
    it("errors if given non-features", () => {
        expect( () => new NavigationContext("Bad", [{cat: "meow"}]) ).toThrow(Error);
    });
});

describe("Getters", () => {
    it("getName() is correct", () => {
        expect(instance.getName()).toBe(NAME);
    });

    it("getTotalBases() is correct", () => {
        expect(instance.getTotalBases()).toBe(30);
    });

    it("getIsValidBase() is correct", () => {
        expect(instance.getIsValidBase(0)).toBe(true);
        expect(instance.getIsValidBase(29)).toBe(true);
        expect(instance.getIsValidBase(-1)).toBe(false);
        expect(instance.getIsValidBase(30)).toBe(false);
    });
});

describe("getFeatureStart()", () => {
    it("is correct", () => {
        expect(instance.getFeatureStart(FEATURES[0])).toBe(0);
        expect(instance.getFeatureStart(FEATURES[2])).toBe(20);
    });

    it("errors when given an outside feature", () => {
        const notInTheContext = new Feature('', new ChromosomeInterval('', 0, 10));
        expect(() => instance.getFeatureStart(notInTheContext)).toThrow(RangeError);
    });
});

describe("convertBaseToFeatureCoordinate()", () => {
    it("returns the right info", () => {
        const coordinate = instance.convertBaseToFeatureCoordinate(10);
        expect(coordinate.getName()).toEqual("f2");
        expect(coordinate.relativeStart).toEqual(0);
    });

    it("errors when given a base outside the genome", () => {
        expect(() => instance.convertBaseToFeatureCoordinate(-1)).toThrow(RangeError);
        expect(() => instance.convertBaseToFeatureCoordinate(100)).toThrow(RangeError);
    });
});

describe("parse()", () => {
    it("parses a locus correctly", () => {
        expect(instance.parse("chr1:0-1000")).toEqual({start: 0, end: 10});
    });

    it("parses just a feature name correctly", () => {
        expect(instance.parse("f2")).toEqual({start: 10, end: 20});
    });

    it("errors if given a locus completely not in the context", () => {
        expect(() => instance.parse("chr1:100-140")).toThrow(RangeError);
    });

    it("errors if end base is before start base", () => {
        expect(() => instance.parse("chr1:10-1")).toThrow(RangeError);
    });

    it("errors if the chromosome or feature doesn't exist", () => {
        expect(() => instance.parse("meow")).toThrow(RangeError);
    });
});

describe("convertGenomeIntervalToBases()", () => {
    it("is correct for 0 mappings", () => {
        const chrInterval = new ChromosomeInterval("chr1", -1, -1);
        expect(instance.convertGenomeIntervalToBases(chrInterval)).toEqual([]);

        const nonsense = new ChromosomeInterval("akjsdhlk", 0, 0);
        expect(instance.convertGenomeIntervalToBases(nonsense)).toEqual([]);
    });

    it("is correct for one mapping", () => {
        const chrInterval = new ChromosomeInterval("chr1", 5, 10);
        expect(instance.convertGenomeIntervalToBases(chrInterval)).toEqual([new OpenInterval(5, 10)]);
    });

    it("is correct for multiple mappings", () => {
        const chrInterval = new ChromosomeInterval("chr2", 5, 10);
        expect(instance.convertGenomeIntervalToBases(chrInterval)).toEqual([
            new OpenInterval(15, 20),
            new OpenInterval(20, 25)
        ]);
    });
});

describe("getFeaturesInInterval()", () => {
    it("gets one segment properly", () => {
        let result = instance.getFeaturesInInterval(10, 20).map(interval => interval.toString());
        expect(result).toEqual(["f2:0-10"]);
    });

    it("gets multiple segments properly", () => {
        let result = instance.getFeaturesInInterval(4, 22).map(interval => interval.toString());
        expect(result).toEqual([
            "f1:4-10",
            "f2:0-10",
            "f3:0-2",
        ]);
    });
});

describe("getLociInInterval()", () => {
    it("gets unique genome loci", () => {
        let result = instance.getLociInInterval(4, 30).map(locus => locus.toString());
        expect(result).toEqual([
            "chr1:4-10",
            "chr2:0-15"
        ]);
    });
});
