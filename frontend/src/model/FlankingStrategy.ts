import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import { Genome } from './genomes/Genome';

type FlankingStrategyType = 0 | 1 | 2;

/**
 * A FlankingStrategy without the methods.
 */
export interface IFlankingStrategy {
    type: FlankingStrategyType;
    upstream: number;
    downstream: number;
}

/**
 * An algorithm that modifies feature coordinates.
 * 
 * @implements {Serializable}
 * @author Silas Hsu
 */
class FlankingStrategy {
    static SURROUND_ALL: FlankingStrategyType = 0;
    static SURROUND_START: FlankingStrategyType = 1;
    static SURROUND_END: FlankingStrategyType = 2;

    /**
     * Makes a new instance.  Does not do any sanity checks; nonsense parameters will cause `makeFlankedFeature` to
     * return null.
     * 
     * @param {FlankingStrategyType} [type] - type of strategy; see static variables for a selection
     * @param {number} [upstream] - number of bases upstream to expand input features
     * @param {number} [downstream] - number of bases downstream to expand input features
     */
    constructor(public type: FlankingStrategyType = FlankingStrategy.SURROUND_ALL, public upstream: number = 0,
            public downstream: number = 0)
        {
        this.type = type;
        this.upstream = Math.round(Number(upstream));
        this.downstream = Math.round(Number(downstream));
    }

    /**
     * @return {this}
     */
    serialize() {
        return this;
    }

    /**
     * @param {IFlankingStrategy} object
     * @return {IFlankingStrategy}
     */
    static deserialize(object: IFlankingStrategy) {
        return new FlankingStrategy(object.type, object.upstream, object.downstream);
    }

    /**
     * Shallowly clones this, sets a prop to a value, and returns the result.
     * 
     * @param {string} prop - the prop to set
     * @param {any} value - the value to set
     * @return {FlankingStrategy} cloned and modified version of this
     */
    cloneAndSetProp(prop: string, value: any): FlankingStrategy {
        const newStrategy = new FlankingStrategy(this.type, this.upstream, this.downstream);
        newStrategy[prop] = value;
        return newStrategy;
    }

    /**
     * Makes a new Feature with a locus that flanks some part of the input Feature, depending on strategy type.  The
     * genome parameter ensures that the modified locus stays within the genome.  If the input Feature is not in the
     * genome at all, returns null.
     * 
     * @param {Feature} feature - feature whose coordinates to use
     * @param {Genome} genome - the genome in which this feature is located
     * @return {Feature} new Feature whose locus is based off the input Feature
     */
    makeFlankedFeature(feature: Feature, genome: Genome): Feature {
        const unsafeInterval = this._makeFlankedCoordinates(feature.getLocus(), feature.getIsForwardStrand());
        const safeInterval = genome.intersectInterval(unsafeInterval);
        if (!safeInterval) {
            return null;
        }
        return new Feature(feature.getName(), safeInterval, feature.getStrand());
    }

    /**
     * From the input genomic location, makes a new location flanking some part of it depending on this strategy type.
     * Does no checks to ensure the output is within the genome.
     * 
     * @param {ChromosomeInterval} locus - location to flank
     * @param {boolean} isForwardStrand - strand of the input; affects what is upstream and downstream
     * @return {ChromosomeInterval} flanked location
     */
    _makeFlankedCoordinates(locus: ChromosomeInterval, isForwardStrand: boolean): ChromosomeInterval {
        let transcriptionStart, transcriptionEnd, moveUpstream, moveDownstream;
        if (isForwardStrand) {
            transcriptionStart = locus.start;
            transcriptionEnd = locus.end;
            moveUpstream = (base: number) => base - this.upstream;
            moveDownstream = (base: number) => base + this.downstream;
        } else {
            transcriptionStart = locus.end;
            transcriptionEnd = locus.start;
            moveUpstream = (base: number) => base + this.upstream;
            moveDownstream = (base: number) => base - this.downstream;
        }

        let newInterval;
        switch (this.type) {
            case FlankingStrategy.SURROUND_ALL:
                newInterval = [transcriptionStart, transcriptionEnd];
                break;
            case FlankingStrategy.SURROUND_START:
                newInterval = [transcriptionStart, transcriptionStart];
                break;
            case FlankingStrategy.SURROUND_END:
                newInterval = [transcriptionEnd, transcriptionEnd];
                break;
            default:
                console.warn("Unknown strategy type; defaulting to SURROUND_ALL");
                newInterval = [transcriptionStart, transcriptionEnd];
        }

        newInterval[0] = moveUpstream(newInterval[0]);
        newInterval[1] = moveDownstream(newInterval[1]);
        if (newInterval[0] <= newInterval[1]) {
            return new ChromosomeInterval(locus.chr, newInterval[0], newInterval[1]);
        } else {
            return new ChromosomeInterval(locus.chr, newInterval[1], newInterval[0]);
        }
    }
}

export default FlankingStrategy;
