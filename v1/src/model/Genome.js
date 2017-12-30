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
    }

    getName() {
        return this._name;
    }

    getChromosomes() {
        return this._chromosomes;
    }

    makeNavContext() {
        const features = this._chromosomes.map(chr => {
            const name = chr.getName();
            return new Feature(name, new ChromosomeInterval(name, 0, chr.getLength()))
        });
        return new NavigationContext(this.getName(), features);
    }
}

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
