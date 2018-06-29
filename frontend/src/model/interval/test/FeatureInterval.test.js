import { FeatureSegment } from '../FeatureSegment';
import ChromosomeInterval from '../ChromosomeInterval';
import Feature from '../../Feature';

const FEATURE = new Feature("meow", new ChromosomeInterval("chr1", 10, 20));

describe("constructor", () => {
    it("sets instance variables correctly", () => {
        const instance = new FeatureSegment(FEATURE, 0, 5);
        expect(instance.feature).toBe(FEATURE);
        expect(instance.relativeStart).toBe(0);
        expect(instance.relativeEnd).toBe(5);
    });

    it("sets a default interval of the feature's entire length", () => {
        const instance = new FeatureSegment(FEATURE);
        expect(instance.relativeStart).toBe(0);
        expect(instance.relativeEnd).toBe(FEATURE.getLength());
    });

    it("errors when end is less than start", () => {
        expect(() => new FeatureSegment(FEATURE, 1, 0)).toThrow(RangeError);
    });

    it("errors when the interval would lie outside the feature", () => {
        const length = FEATURE.getLength();
        expect(() => new FeatureSegment(FEATURE, -1, 0)).toThrow(RangeError);
        expect(() => new FeatureSegment(FEATURE, length, length + 1)).toThrow(RangeError);
    });
});

describe("methods", () => {
    const INSTANCE = new FeatureSegment(FEATURE, 0, 5);

    it("isValidBase() is correct", () => {
        expect(INSTANCE.isValidBase(8)).toBe(true);
        expect(INSTANCE.isValidBase(-1)).toBe(false);
    });

    it("getName() is correct", () => {
        expect(INSTANCE.getName()).toBe("meow");
    });

    it("getLength() is correct", () => {
        expect(INSTANCE.getLength()).toBe(5);
    });

    it("getGenomeCoordinates() is correct", () => {
        expect(INSTANCE.getGenomeCoordinates()).toEqual(new ChromosomeInterval("chr1", 10, 15));
    });

    it("getOverlap() is correct", () => {
        expect(INSTANCE.getOverlap(new ChromosomeInterval("chr1", 13, 20)))
            .toEqual(new FeatureSegment(FEATURE, 3, 5));
    });

    it("toString() is correct", () => {
        expect(INSTANCE.toString()).toBe("meow:0-5");
    });

    it("toStringWithOther() is correct", () => {
        const feature2 = new Feature("meow2", new ChromosomeInterval("chr1", 0, 10));
        const instance2 = new FeatureSegment(feature2, 5, 10);
        expect(INSTANCE.toStringWithOther(instance2)).toBe("meow:0-meow2:10");
    });
});
