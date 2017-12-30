import NavigationContext from '../NavigationContext';
import { CHROMOSOMES } from './toyRegion';

const NAME = "Wow very genome";
const instance = new NavigationContext(NAME, CHROMOSOMES);

describe("constructor", () => {
    it("errors if not given any segments", () => {
        expect( () => new NavigationContext("Bad", []) ).toThrow(Error);
    });

    it("errors if given segments with no info", () => {
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
