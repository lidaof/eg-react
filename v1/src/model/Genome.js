import Feature from './Feature';
import NavigationContext from './NavigationContext';
import ChromosomeInterval from './interval/ChromosomeInterval';

export class Chromosome {
    constructor(name, length) {
        this._name = name;
        this._length = length;
    }

    getName() {
        return this._name;
    }

    getLength() {
        return this._length;
    }
}

export class Genome {
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

    getName() {
        return this._name;
    }

    getChromosome(name) {
        return this._nameToChromosome[name] || null;
    }

    intersectInterval(chrInterval) {
        const chrName = chrInterval.chr;
        const matchingChr = this.getChromosome(chrName);
        if (!matchingChr) {
            return null;
        }
        return new ChromosomeInterval(chrName, 0, matchingChr.getLength()).getOverlap(chrInterval);
    }

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
