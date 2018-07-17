import Feature from '../Feature';
import NavigationContext from '../NavigationContext';
import ChromosomeInterval from '../interval/ChromosomeInterval';
import OpenInterval from '../interval/OpenInterval';
import TrackModel from '../TrackModel';
import Chromosome from './Chromosome';

export interface GenomeConfig {
    genome: Genome;
    navContext: NavigationContext;
    cytobands: any;
    defaultRegion: OpenInterval;
    defaultTracks: TrackModel[];
    twoBitUrl: string;
}

/**
 * A named set of chromosomes.
 * 
 * @author Silas Hsu
 */
export class Genome {
    private _name: string;
    private _chromosomes: Chromosome[];
    private _nameToChromosome: {[chrName: string]: Chromosome};

    /**
     * Makes a new instance, with name and list of chromosomes.  For best results, chromosomes should have unique names.
     * 
     * @param {string} name - name of the genome
     * @param {Chromosome[]} chromosomes - list of chromosomes in the genome
     */
    constructor(name: string, chromosomes: Chromosome[]) {
        this._name = name;
        this._chromosomes = chromosomes;
        this._nameToChromosome = {};
        for (const chromosome of chromosomes) {
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
    getName(): string {
        return this._name;
    }

    /**
     * Gets a chromosome with the specified name.  Returns null if there is no such chromosome.
     * 
     * @param {string} name - chromosome name to look up
     * @return {Chromosome} chromosome with the query name, or null if not found
     */
    getChromosome(name: string): Chromosome {
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
    intersectInterval(chrInterval: ChromosomeInterval): ChromosomeInterval {
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
    makeNavContext(): NavigationContext {
        const features = this._chromosomes.map(chr => {
            const name = chr.getName();
            return new Feature(name, new ChromosomeInterval(name, 0, chr.getLength()))
        });
        return new NavigationContext(this.getName(), features, true);
    }
}

export default Genome;
