import makeToyRegion from './toyRegion';
import Gene from '../Gene';

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
        let gene = new Gene(INPUT);
        const EXPECTED = {
            chr: "chr2",
            chromosome: "chr2",
            start: 2,
            end: 4,
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
            exons: [[2, 4]]
        }
        expect(gene).toEqual(EXPECTED);
    });

    it('setModel() works correctly', () => {
        const ADDITIONAL_PROPS = {
            absStart: 11,
            absEnd: 13,
            absExons: [ [11, 13] ],
            isInView: true
        }
        const EXPECTED = Object.assign(new Gene(INPUT), ADDITIONAL_PROPS);
    
        let gene = new Gene(INPUT);
        gene.setModel(makeToyRegion(10, 20));
        expect(gene).toEqual(EXPECTED);
    });
});


