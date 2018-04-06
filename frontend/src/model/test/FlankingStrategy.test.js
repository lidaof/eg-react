import FlankingStrategy from '../FlankingStrategy';
import { Chromosome, Genome } from '../genomes/Genome';
import Feature from '../Feature';
import ChromosomeInterval from '../interval/ChromosomeInterval';

const GENOME = new Genome("Gee, gnome!", [new Chromosome("chr1", 10)]);

describe("makeFlankedFeature()", () => {
    const FEATURE_NAME = "featuring... my feature!";
    const FEATURE = new Feature(FEATURE_NAME, new ChromosomeInterval("chr1", 5, 6));

    it("SURROUND_ALL is correct", () => {
        const instance = new FlankingStrategy(FlankingStrategy.SURROUND_ALL, 1, 2);
        const expected = new Feature(FEATURE_NAME, new ChromosomeInterval("chr1", 4, 8));
        expect(instance.makeFlankedFeature(FEATURE, GENOME)).toEqual(expected);
    });
    
    it("SURROUND_START is correct", () => {
        const instance = new FlankingStrategy(FlankingStrategy.SURROUND_START, 1, 2);
        const expected = new Feature(FEATURE_NAME, new ChromosomeInterval("chr1", 4, 7));
        expect(instance.makeFlankedFeature(FEATURE, GENOME)).toEqual(expected);
    });

    it("SURROUND_END is correct", () => {
        const instance = new FlankingStrategy(FlankingStrategy.SURROUND_END, 1, 2);
        const expected = new Feature(FEATURE_NAME, new ChromosomeInterval("chr1", 5, 8));
        expect(instance.makeFlankedFeature(FEATURE, GENOME)).toEqual(expected);
    });

    it("truncates results outside the genome", () => {
        const instance = new FlankingStrategy(FlankingStrategy.SURROUND_ALL, 10000, 10000);
        const expected = new Feature(FEATURE_NAME, new ChromosomeInterval("chr1", 0, 10));
        expect(instance.makeFlankedFeature(FEATURE, GENOME)).toEqual(expected);
    });

    it("returns null if the feature is not in the genome", () => {
        const instance = new FlankingStrategy(FlankingStrategy.SURROUND_ALL, 1, 2);
        const notInGenome = new Feature(FEATURE_NAME, new ChromosomeInterval("chr2", 0, 10));
        expect(instance.makeFlankedFeature(notInGenome, GENOME)).toBeNull();
    });

    it("considers reverse strand", () => {
        const reverseFeature = new Feature(FEATURE_NAME, new ChromosomeInterval("chr1", 5, 6), false);
        const instance = new FlankingStrategy(FlankingStrategy.SURROUND_ALL, 1, 2);
        const expected = new Feature(FEATURE_NAME, new ChromosomeInterval("chr1", 3, 7), false);
        expect(instance.makeFlankedFeature(reverseFeature, GENOME)).toEqual(expected);
    });
});
