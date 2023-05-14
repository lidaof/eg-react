import { GraphNode } from "./GraphNode";
import { Strand } from "../Feature";

export class GraphLink {
    constructor(public source: GraphNode, public target: GraphNode, public sourceStrand: Strand, public targetStrand: Strand, public rank: number = 0) {
        this.source = source;
        this.target = target;
        this.sourceStrand = sourceStrand;
        this.targetStrand = targetStrand;
        this.rank = rank;
    }
}