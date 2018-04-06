import { Chromosome, Genome } from '../Genome';
import ChromosomeInterval from '../../interval/ChromosomeInterval';

const CHROMOSOMES = [
    new Chromosome("chr1", 10),
    new Chromosome("chr2", 10),
    new Chromosome("chr3", 10),
];
const INSTANCE = new Genome("my little genome", CHROMOSOMES);

describe("getters", () => {
    it("getName() is correct", () => {
        expect(INSTANCE.getName()).toBe("my little genome");
    });

    it("getChromosome() is correct", () => {
        expect(INSTANCE.getChromosome("chr1")).toBe(CHROMOSOMES[0]);
        expect(INSTANCE.getChromosome("wat is this")).toBeNull();
    });
});

describe("intersectInterval()", () => {
    it("works correctly", () => {
        const input = new ChromosomeInterval("chr3", 0, 40);
        const expected = new ChromosomeInterval("chr3", 0, 10)
        expect(INSTANCE.intersectInterval(input)).toEqual(expected);
    });

    it("returns null for intervals not in the genome", () => {
        const input = new ChromosomeInterval("chr1", 30, 40);
        const input2 = new ChromosomeInterval("wat is this", 0, 10);
        expect(INSTANCE.intersectInterval(input)).toBeNull();
        expect(INSTANCE.intersectInterval(input2)).toBeNull();
    });
});

describe("makeNavContext()", () => {
    it("works correctly", () => {
        const navContext = INSTANCE.makeNavContext();
        expect(navContext.getName()).toBe(INSTANCE.getName());
        expect(navContext.getTotalBases()).toBe(30);
        const features = navContext.getFeatures()
        for (let i = 0; i < CHROMOSOMES.length; i++) {
            expect(features[i].getName()).toBe(CHROMOSOMES[i].getName());
            expect(features[i].getLength()).toBe(CHROMOSOMES[i].getLength());
        }
    });
});
