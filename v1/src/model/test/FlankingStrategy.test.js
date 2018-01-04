import FlankingStrategy from '../FlankingStrategy';
import { Chromosome, Genome } from '../Genome';
import Feature from '../Feature';
import ChromosomeInterval from '../interval/ChromosomeInterval';

describe("checkValid()", () => {
    it("returns an error for an unknown strategy type", () => {
        const instance = new FlankingStrategy(-1);
        expect(instance.checkValid()).toBeInstanceOf(Error);
    });

    it("returns an error for negative base numbers", () => {
        const instance = new FlankingStrategy(FlankingStrategy.SURROUND_ALL, -1, 0);
        expect(instance.checkValid()).toBeInstanceOf(Error);

        const instance2 = new FlankingStrategy(FlankingStrategy.SURROUND_ALL, 0, -1);
        expect(instance2.checkValid()).toBeInstanceOf(Error);
    });

    it("returns an error for invalid and noninteger base numbers", () => {
        const instance = new FlankingStrategy(FlankingStrategy.SURROUND_ALL, NaN, NaN);
        expect(instance.checkValid()).toBeInstanceOf(Error);

        const instance2 = new FlankingStrategy(FlankingStrategy.SURROUND_ALL, 1.5, 2.5);
        expect(instance2.checkValid()).toBeInstanceOf(Error);
    });

    it("returns null for a valid configuration", () => {
        const instance = new FlankingStrategy();
        expect(instance.checkValid()).toBeNull();

        const instance2 = new FlankingStrategy(FlankingStrategy.SURROUND_START, 0, 10);
        expect(instance2.checkValid()).toBeNull();
    });
});


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
