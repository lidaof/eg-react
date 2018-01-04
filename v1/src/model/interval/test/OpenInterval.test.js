import OpenInterval from '../OpenInterval';

describe("constructor", () => {
    it("saves start and end", () => {
        const interval = new OpenInterval(0, 10);
        expect(interval.start).toEqual(0);
        expect(interval.end).toEqual(10);
    });

    it("errors if end is before start", () => {
        expect(() => new OpenInterval(10, 0)).toThrow(RangeError);
    });
});

describe("iteration", () => {
    it("works", () => {
        const interval = new OpenInterval(0, 10);
        expect([...interval]).toEqual([0, 10]);
    });
});

describe("getLength()", () => {
    it("works", () => {
        const interval = new OpenInterval(0, 10);
        expect(interval.getLength()).toEqual(10);
    });
});
