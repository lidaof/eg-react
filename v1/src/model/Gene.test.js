import makeToyRegion from './toyRegion';
import Gene from './Gene';

const REGION = makeToyRegion(10, 20);

const PLAIN_OBJECT = {
    chromosome: "chr2",
    start: 2,
    end: 4,
    accession: "GENE!",
    id: 12345,
    strand: "+",
    exons: [ [2, 4] ],
    description: "wow very gene",
    name: "Jene",
}

const ADDITIONAL_PROPS = {
    absStart: 11,
    absEnd: 13,
    absExons: [ [11, 13] ],
    isInView: true
}

const EXPECTED = Object.assign({}, PLAIN_OBJECT, ADDITIONAL_PROPS);

it('constructs correctly', () => {
    expect(new Gene(PLAIN_OBJECT, REGION)).toEqual(EXPECTED);
});
