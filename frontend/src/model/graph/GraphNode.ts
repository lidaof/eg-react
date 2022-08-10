import ChromosomeInterval, { IChromosomeInterval } from "../interval/ChromosomeInterval";
import NavigationContext from "../NavigationContext";

/**
 * The properties of GraphNode without the methods.
 */
export interface IGraphNode {
    name: string;
    locus: IChromosomeInterval;
    rank: number;
    // strand: Strand;
}


/**
 * A GraphNode, in the graph genome.
 *
 * @author Daofeng Li
 */
export class GraphNode {
    name: string; // - name of the node
    /**
     * Makes a new instance with specified name and locus.  Empty names are valid.  If given `undefined` or `null`, it
     * defaults to the locus as a string.
     *
     * @param {string} [name] - name of the feature
     * @param {ChromosomeInterval} locus - genomic location of the feature
     */
    constructor(name: string, public locus: ChromosomeInterval, public rank: number = 0) {
        this.name = name === undefined ? locus.toString() : name; // eslint-disable-line eqeqeq
        this.locus = locus;
        this.rank  = rank;
    }

    serialize(): IGraphNode {
        return {
            name: this.name,
            locus: this.getLocus().serialize(),
            rank: this.rank,
        };
    }

    static deserialize(object: IGraphNode) {
        return new GraphNode(object.name, ChromosomeInterval.deserialize(object.locus), object.rank);
    }

    /**
     * @return {string} the name of this feature
     */
    getName(): string {
        return this.name;
    }

    /**
     * @return {ChromosomeInterval} the genomic location of this feature
     */
    getLocus(): ChromosomeInterval {
        return this.locus;
    }

    /**
     * @return {number} the length of this feature's locus
     */
    getLength(): number {
        return this.locus.getLength();
    }

    getRank(): number {
        return this.rank;
 }
    computeNavContextCoordinates(navContext: NavigationContext) {
        return navContext.convertGenomeIntervalToBases(this.getLocus());
    }
}
/**
 * 
 * @param raw 
 * {len: 8677
name: "s73410"
rank: 0
sname: "chr7"
soff: 26715364}
 */

interface IRawNode {
    len: number;
    name: string;
    rank: number;
    sname: string;
    soff: number;
}

export function nodeFromRawNode(raw: IRawNode){
    return new GraphNode(raw.name, new ChromosomeInterval(raw.sname, raw.soff, raw.soff+raw.len), raw.rank);
}
