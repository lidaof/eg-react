import { Feature } from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';

export class SequenceData extends Feature {
    public sequence: string;
    
    constructor(locus: ChromosomeInterval, sequence: string) {
        super(undefined, locus);
        this.sequence = sequence;
    }
}
