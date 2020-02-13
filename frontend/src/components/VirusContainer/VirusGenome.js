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
     * @param {string} fastaUrl - list of chromosomes in the genome
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
}

export default VirusGenome;
