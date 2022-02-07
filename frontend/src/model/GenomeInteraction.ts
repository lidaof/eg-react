import ChromosomeInterval from "./interval/ChromosomeInterval";

export class GenomeInteraction {
    constructor(
        public locus1: ChromosomeInterval,
        public locus2: ChromosomeInterval,
        public score = 0,
        public name: string = undefined,
        public color: string = undefined
    ) {
        this.locus1 = locus1;
        this.locus2 = locus2;
        this.score = score;
        this.name = name;
        this.color = color;
    }

    getDistance() {
        return Math.round(Math.abs(this.locus1.start - this.locus2.start));
    }
}
