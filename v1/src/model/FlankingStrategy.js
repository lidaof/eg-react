import _ from 'lodash';
import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';
import { Gene } from './Gene';

class FlankingStrategy {
    static SURROUND_ALL = 0;
    static SURROUND_START = 1;
    static SURROUND_END = 2;

    constructor(type=FlankingStrategy.SURROUND_ALL, upstream=0, downstream=0) {
        this.type = type;
        this.upstream = upstream;
        this.downstream = downstream;
    }

    assertIsValid(minRegionLength=1) {
        const allStrats = [
            FlankingStrategy.SURROUND_ALL,
            FlankingStrategy.SURROUND_START,
            FlankingStrategy.SURROUND_END,
        ];
        if (allStrats.find(strat => strat === this.type) === undefined) {
            throw new RangeError("Unknown strategy type");
        }

        if (!Number.isSafeInteger(this.upstream) || !Number.isSafeInteger(this.downstream) || 
                this.upstream < 0 || this.downstream < 0) {
            throw new RangeError("Must give positive number of bases");
        }

        if (this.type === FlankingStrategy.SURROUND_START || this.type === FlankingStrategy.SURROUND_END) {
            if (this.upstream + this.downstream < minRegionLength) {
                throw new RangeError("Resulting regions will be too short");
            }
        }
    }

    cloneAndSetProp(prop, value) {
        let newStrategy = _.clone(this);
        newStrategy[prop] = value;
        return newStrategy;
    }

    makeFlankedFeature(feature, genome) {
        let isForwardStrand = true;
        if (feature instanceof Gene && feature.getDetails().strand === "-") {
            isForwardStrand = false;
        }

        const unsafeInterval = this._makeFlankedCoordinates(feature.getCoordinates(), isForwardStrand);
        const safeInterval = genome.intersectInterval(unsafeInterval);
        if (!safeInterval) {
            return null;
        }
        return new Feature(feature.getName(), safeInterval);
    }

    _makeFlankedCoordinates(locus, isForwardStrand) {
        let transcriptionStart, transcriptionEnd, moveUpstream, moveDownstream;
        if (isForwardStrand) {
            transcriptionStart = locus.start;
            transcriptionEnd = locus.end;
            moveUpstream = base => base - this.upstream;
            moveDownstream = base => base + this.downstream;
        } else {
            transcriptionStart = locus.end;
            transcriptionEnd = locus.start;
            moveUpstream = base => base + this.upstream;
            moveDownstream = base => base - this.downstream;
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
                throw new Error("Unknown strategy type");
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
