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

    it('constructs correctly', () => {
        let gene = new Gene(INPUT, makeToyRegion(10, 20));
        const EXPECTED = {
            chr: "chr2",
            _start: 2,
            _end: 4,
            details: {
                name: "GENE!",
                name2: "Jene",
                strand: "+",
                id: 12345,
                desc: "wow very gene",
                struct: {
                    thick: [[2, 4]],
                    thin: [[2, 4]]
                }
            },
            exons: [[2, 4]],
            // Additional props from the model
            absStart: 12,
            absEnd: 14,
            absExons: [ new Interval(12, 14) ],
            isInView: true
        }
        expect(gene).toEqual(EXPECTED);
    });
});


