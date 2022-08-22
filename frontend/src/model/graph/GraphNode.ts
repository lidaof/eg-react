import { Feature, Strand } from "./../Feature";
import ChromosomeInterval, { IChromosomeInterval } from "../interval/ChromosomeInterval";

/**
 * The properties of GraphNode without the methods.
 */
export interface IGraphNode {
    name: string;
    locus: IChromosomeInterval;
    strand: Strand;
    rank: number;
}

/**
 * A GraphNode, in the graph genome.
 * a feature with rank, maybe other methods and props in future so in a separate file
 * @author Daofeng Li
 */
export class GraphNode extends Feature {
    /**
     *
     * @param {string} [name] - name of the node
     * @param {ChromosomeInterval} locus - genomic location of the node
     */
    constructor(name: string, public locus: ChromosomeInterval, public rank: number = 0) {
        super(name, locus);
        this.rank = rank;
    }

    serialize(): IGraphNode {
        return {
            name: this.name,
            locus: this.getLocus().serialize(),
            strand: this.strand,
            rank: this.rank,
        };
    }

    static deserialize(object: IGraphNode) {
        return new GraphNode(object.name, ChromosomeInterval.deserialize(object.locus), object.rank);
    }

    getRank(): number {
        return this.rank;
    }
}
/**
 * the raw data from brgfa file record
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

export function nodeFromRawNode(raw: IRawNode) {
    return new GraphNode(raw.name, new ChromosomeInterval(raw.sname, raw.soff, raw.soff + raw.len), raw.rank);
}
