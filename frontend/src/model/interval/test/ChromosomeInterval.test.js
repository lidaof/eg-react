import ChromosomeInterval from '../ChromosomeInterval';

describe("parse()", () => {
    it("parses normal input correctly", () => {
        expect(ChromosomeInterval.parse("myChr:1-10")).toEqual(new ChromosomeInterval("myChr", 1, 10));
    });

    it("throws on malformed input", () => {
        expect(() => ChromosomeInterval.parse("sad3*#$c)")).toThrow(RangeError);
        expect(() => ChromosomeInterval.parse("chrWow!:1-10")).toThrow(RangeError);
        expect(() => ChromosomeInterval.parse("chr1:-1-10")).toThrow(RangeError);
    });
});

describe("mergeOverlaps", () => {
    it("works for an empty array", () => {
        expect(ChromosomeInterval.mergeOverlaps([])).toEqual([]);
    });

    it("merges intervals properly", () => {
        const INPUT = [
            new ChromosomeInterval("chr1", 10, 15),
            new ChromosomeInterval("chr1", 2, 7),
            new ChromosomeInterval("chr1", 5, 10),

            new ChromosomeInterval("chr2", 5, 6),
            new ChromosomeInterval("chr2", 0, 10),
            new ChromosomeInterval("chr2", 11, 12),
        ];
        const EXPECTED = new Set([
            new ChromosomeInterval("chr1", 2, 15),
            new ChromosomeInterval("chr2", 0, 10),
            new ChromosomeInterval("chr2", 11, 12),
        ]);
        expect(new Set(ChromosomeInterval.mergeOverlaps(INPUT, 0))).toEqual(EXPECTED)
    });
});

describe("getOverlap()", () => {
    it("correctly intersects", () => {
        const interval1 = new ChromosomeInterval("chr1", 0, 10);
        const interval2 = new ChromosomeInterval("chr1", 5, 15);
        expect(interval1.getOverlap(interval2)).toEqual(new ChromosomeInterval("chr1", 5, 10));
    });

    it("returns null if chromosome names do not match", () => {
        const interval1 = new ChromosomeInterval("chr1", 0, 10);
        const interval2 = new ChromosomeInterval("chr2", 0, 10);
        expect(interval1.getOverlap(interval2)).toBeNull();
    });

    it("returns null if there is no intersection", () => {
        const interval1 = new ChromosomeInterval("chr1", 0, 10);
        const interval2 = new ChromosomeInterval("chr1", 10, 20);
        expect(interval1.getOverlap(interval2)).toBeNull();
    });
});

describe("toString()", () => {
    it("is correct", () => {
        const interval = new ChromosomeInterval("chr1", 0, 10);
        expect(interval.toString()).toBe("chr1:0-10")
    });
});

describe("toStringWithOther()", () => {
    it("is correct", () => {
        const interval1 = new ChromosomeInterval("chr1", 0, 10);
        const interval2 = new ChromosomeInterval("chr2", 10, 20);
        expect(interval1.toStringWithOther(interval2)).toBe("chr1:0-chr2:20");
    });
});
