import makeToyRegion from './toyRegion';
import Gene from '../Gene';
import Interval from '../Interval';

describe('Gene', () => {
    const INPUT = {
        chr: "chr2",
        start: 2,
        end: 4,
        details: `
            name: "GENE!",
            name2: "Jene",
            strand: "+",
            id: 12345,
            desc: "wow very gene",
            struct: {
                thick: [[2, 4]],
                thin: [[2, 4]]
            }
        `
    };

    let INSTANCE;
    beforeEach(() => {
        INSTANCE = new Gene(INPUT, makeToyRegion(10, 20), "chr2");
    });

    it('constructs correctly', () => {
        let INSTANCE = new Gene(INPUT, makeToyRegion(10, 20), "chr2");
        expect(INSTANCE.chr).toBe("chr2");
        expect([...INSTANCE.get0Indexed()]).toEqual([2, 4]);
        expect([INSTANCE.absStart, INSTANCE.absEnd]).toEqual([12, 14]);
    });

    it('getIsInView() works correctly', () => {
        expect(INSTANCE.getIsInView(makeToyRegion(0, 10))).toBe(false);
        expect(INSTANCE.getIsInView(makeToyRegion(10, 20))).toBe(true);
    });

    it('getDetails() works correctly', () => {
        expect(INSTANCE.getDetails()).toEqual({
            name: "GENE!",
            name2: "Jene",
            strand: "+",
            id: 12345,
            desc: "wow very gene",
            struct: {
                thick: [[2, 4]],
                thin: [[2, 4]]
            },
            exons: [[2, 4]],
            absExons: [ new Interval(12, 14) ],
        });
    });
});
