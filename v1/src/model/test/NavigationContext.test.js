import NavigationContext from '../NavigationContext';
import { CHROMOSOMES } from './toyRegion';
import Feature from '../Feature';
import FeatureInterval from '../interval/FeatureInterval';
import ChromosomeInterval from '../interval/ChromosomeInterval';
import { OpenInterval } from '../interval/OpenInterval';

const NAME = "Wow very genome";
const instance = new NavigationContext(NAME, CHROMOSOMES);

describe("constructor", () => {
    it("errors if not given any features", () => {
        expect( () => new NavigationContext("Bad", []) ).toThrow(Error);
    });

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
        expect(instance.getFeatureStart("chr1")).toBe(0);
        expect(instance.getFeatureStart("chr3")).toBe(20);
    });

    it("errors when given an unknown feature name", () => {
        expect(() => instance.getFeatureStart(null)).toThrow(RangeError);
        expect(() => instance.getFeatureStart("very chromosome")).toThrow(RangeError);
    });
});

describe("convertBaseToFeatureCoordinate() and convertBaseToFeatureIndex()", () => {
    it("returns the right info", () => {
        const coordinate = instance.convertBaseToFeatureCoordinate(10);
        expect(coordinate.getName()).toEqual("chr2");
        expect(coordinate.relativeStart).toEqual(0);
    });

    it("errors when given a base outside the genome", () => {
        expect(() => instance.convertBaseToFeatureCoordinate(-1)).toThrow(RangeError);
        expect(() => instance.convertBaseToFeatureCoordinate(100)).toThrow(RangeError);
    });
});

describe("parse() and convertFeatureCoordinateToBase()", () => {
    it("parses one segment correctly", () => {
        expect(instance.parse("chr1:0-10")).toEqual({start: 0, end: 10});
    });

    it("parses two segments correctly", () => {
        expect(instance.parse("chr1:9-chr3:1")).toEqual({start: 9, end: 21});
    });

    it("errors if given a nonsensical string", () => {
        expect(() => instance.parse("chr1:234s-130")).toThrow(RangeError);
    });

    it("errors if end base is before start base", () => {
        expect(() => instance.parse("chr1:10-1")).toThrow(RangeError);
        expect(() => instance.parse("chr2:1-chr1:5")).toThrow(RangeError);
    });

    it("errors if the chromosome doesn't exist", () => {
        expect(() => instance.parse("chr3:1-chr4:10")).toThrow(RangeError);
    });

    it("errors if the base pair is out of range", () => {
        expect(() => instance.parse("chr1:1-11")).toThrow(RangeError);
    });
});

describe("convertGenomeIntervalToBases()", () => {
    it("is correct", () => {
        const feature = instance.getFeatures()[0];
        const featureInterval = new FeatureInterval(feature);
        const chrInterval = new ChromosomeInterval("chr1", 5, 10);
        expect(instance.convertGenomeIntervalToBases(featureInterval, chrInterval)).toEqual(new OpenInterval(5, 10));
    });

    it("returns null when the feature interval does not overlap with the genome interval", () => {
        const feature = instance.getFeatures()[0];
        const featureInterval = new FeatureInterval(feature);
        const chrInterval = new ChromosomeInterval("chr1", -1, -1);
        expect(instance.convertGenomeIntervalToBases(featureInterval, chrInterval)).toEqual(null);
    });

    it("errors when given a feature not in the context", () => {
        const chrInterval = new ChromosomeInterval("chr1", 5, 10);
        const feature = new Feature("wat is this?", chrInterval);
        const featureInterval = new FeatureInterval(feature);
        expect(() => instance.convertGenomeIntervalToBases(featureInterval, chrInterval)).toThrow(RangeError);
    });
});

describe("getFeaturesInInterval()", () => {
    it("gets one segment properly", () => {
        let result = instance.getFeaturesInInterval(10, 20).map(chr => chr.toString());
        expect(result).toEqual(["chr2:0-10"]);
    });

    it("gets multiple segments properly", () => {
        let result = instance.getFeaturesInInterval(4, 21).map(chr => chr.toString());
        expect(result).toEqual([
            "chr1:4-10",
            "chr2:0-10",
            "chr3:0-1",
        ]);
    });
});
