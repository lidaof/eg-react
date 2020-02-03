import Feature from "../../model/Feature";
import NavigationContext from "../../model/NavigationContext";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import Chromosome from "../../model/genomes/Chromosome";
import axios from "axios";
import readFASTA from "fasta-to-object-parser";
/**
 * A named set of chromosomes.
 *
 * @author Daofeng Li
 */
class VirusGenome {
    /**
     * Makes a new instance, with name and list of chromosomes.  For best results, chromosomes should have unique names.
     *
     * @param {string} name - name of the genome
     * @param {Chromosome[]} chromosomes - list of chromosomes in the genome
     */
    constructor(name, fastaUrl) {
        this._name = name;
        this.fastaUrl = fastaUrl;
        this._fastaObject = null;
        this._chromosomes = [];
        this._nameToChromosome = {};
    }

    /**
     * init the fasta sequence by async parse the data
     */
    async init() {
        try {
            const content = await axios.get(this.fastaUrl);
            const fastaObj = readFASTA(content.data)[0];
            this._fastaObject = fastaObj;
            this._seq = fastaObj.sequence;
            this._length = fastaObj.sequence.length;
            this._description = fastaObj.description;
            this._seqId = fastaObj.description.split(" ")[0];
            this._chromosomes = [new Chromosome(this._seqId, this._length)];
            this._nameToChromosome[this._seqId] = this._chromosomes[0];
        } catch (error) {
            console.error(error);
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
            return new Feature(name, new ChromosomeInterval(name, 0, chr.getLength()));
        });
        return new NavigationContext(this.getName(), features);
    }
}

export default VirusGenome;
