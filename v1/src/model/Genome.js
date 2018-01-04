import Feature from './Feature';
import NavigationContext from './NavigationContext';
import ChromosomeInterval from './interval/ChromosomeInterval';

/**
 * Simple container for chromosome info.
 * 
 * @author Silas Hsu
 */
export class Chromosome {
    /**
     * Makes a new instance with specified name and length in bases.
     * 
     * @param {string} name - name of the chromosome
     * @param {number} length - length of the chromosome in bases
     */
    constructor(name, length) {
        this._name = name;
        this._length = length;
    }

    /**
     * @return {string} this chromosome's name
     */
    getName() {
        return this._name;
    }

    /**
     * @return {number} this chromosome's length in bases
     */
    getLength() {
        return this._length;
    }
}

/**
 * A named set of chromosomes.
 * 
 * @author Silas Hsu
 */
export class Genome {
    /**
     * Makes a new instance, with name and list of chromosomes.  For best results, chromosomes should have unique names.
     * 
     * @param {string} name - name of the genome
     * @param {Chromosome[]} chromosomes - list of chromosomes in the genome
     */
    constructor(name, chromosomes) {
        this._name = name;
        this._chromosomes = chromosomes;
        this._nameToChromosome = {};
        for (let chromosome of chromosomes) {
            const chrName = chromosome.getName();
            if (this._nameToChromosome[chrName] !== undefined) {
                console.warn(`Duplicate chromosome name "${chrName}" in genome "${name}"`);
            }
            this._nameToChromosome[chrName] = chromosome;
        }
    }

    /**
     * @return {string} this genome's name
     */
    getName() {
        return this._name;
    }

    /**
     * Gets a chromosome with the specified name.  Returns null if there is no such chromosome.
     * 
     * @param {string} name - chromosome name to look up
     * @return {Chromosome} chromosome with the query name, or null if not found
     */
    getChromosome(name) {
        return this._nameToChromosome[name] || null;
    }

    /**
     * Intersects a genomic location with this genome.  If there is no overlap, then returns null.  Possible reasons for
     * null include unknown chromosome name or an interval past the end of a chromosome.  Can be used to check/ensure a
     * location actually lies within the genome.
     * 
     * @param {ChromosomeInterval} chrInterval - genomic location to intersect with the genome
     * @return {ChromosomeInterval} intersection result, or null if there is no overlap at all
     */
    intersectInterval(chrInterval) {
        const chrName = chrInterval.chr;
        const matchingChr = this.getChromosome(chrName);
        if (!matchingChr) {
            return null;
        }
        return new ChromosomeInterval(chrName, 0, matchingChr.getLength()).getOverlap(chrInterval);
    }

    /**
     * Makes a NavigationContext representing this genome.  It will have the same name as the genome, and the
     * features/segments will consist of whole chromosomes.
     * 
     * @return {NavigationContext} NavigationContext representing this genome
     */
    makeNavContext() {
        const features = this._chromosomes.map(chr => {
            const name = chr.getName();
            return new Feature(name, new ChromosomeInterval(name, 0, chr.getLength()))
        });
        return new NavigationContext(this.getName(), features);
    }
}

export default Genome;

export const HG19 = new Genome("hg19", [
    new Chromosome("chr1", 249250621),
    new Chromosome("chr2", 243199373),
    new Chromosome("chr3", 198022430),
    new Chromosome("chr4", 191154276),
    new Chromosome("chr5", 180915260),
    new Chromosome("chr6", 171115067),
    new Chromosome("chr7", 159138663),
    new Chromosome("chr8", 146364022),
    new Chromosome("chr9", 141213431),
    new Chromosome("chr10", 135534747),
    new Chromosome("chrY", 59373566)
]);
