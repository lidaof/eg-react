import _ from 'lodash';
import OpenInterval from './interval/OpenInterval';
import { FeatureSegment } from './interval/FeatureSegment';
import ChromosomeInterval from './interval/ChromosomeInterval';
import { Feature } from './Feature';

const GAP_FEATURE_NAME = 'Gap';

/**
 * A implicit coordinate system for the entire genome or a gene set view.  It represents everywhere that a user could
 * potentially navigate and view.
 * 
 * A context constructs this coordinate system through an ordered list of features.  Features in NavigationContexts must
 * have non-empty, unique names.  In addition to this implicit coordinate system, NavContext methods also support
 * feature coordinates, which are a feature and base number relative to the start of the feature.
 * 
 * @author Silas Hsu
 */
class NavigationContext {
    private _name: string;
    private _features: Feature[];
    private _isGenome: boolean;
    private _startCoordinateForFeatureIndex: number[];
    private _indexForFeatureName: {[name: string]: number};
    private _featuresForChr: {[chr: string]: Feature[]};
    private _totalBases: number;

    /**
     * Makes a special "feature" representing a gap in the genome.  To use, insert such objects into the feature list
     * during NavigationContext construction.
     * 
     * @param {number} length - length of the gap in bases
     * @return {Feature} a special "feature" representing a gap in the genome.
     */
    static makeGap(length: number) {
        return new Feature(GAP_FEATURE_NAME, new ChromosomeInterval('', 0, length));
    }

    /**
     * Makes a new instance.  Features must have non-empty, unique names.  The `isGenome` parameter does not change any
     * of the instance's functionality, but if it is true, it optimizes mapping functions.
     * 
     * @param {string} name - name of this context
     * @param {Feature[]} features - list of features
     * @param {boolean} isGenome - whether the context covers the entire genome
     * @throws {Error} if the feature list has a problem
     */
    constructor(name: string, features: Feature[], isGenome=false) {
        this._name = name;
        this._features = features;
        this._isGenome = isGenome;
        this._startCoordinateForFeatureIndex = [];
        this._indexForFeatureName = {};
        this._featuresForChr = _.groupBy(features, feature => feature.getLocus().chr)
        this._totalBases = 0;

        let i = 0;
        for (const feature of features) {
            // Make sure names are unique
            const name = feature.getName();
            if (!name) {
                throw new Error("All features must have names");
            }
            if (this._indexForFeatureName[name] !== undefined && name !== GAP_FEATURE_NAME) {
                throw new Error(`Duplicate name ${name} detected; features must have unique names.`);
            }
            this._indexForFeatureName[name] = i;

            // Add to feature list w/ additional details
            this._startCoordinateForFeatureIndex.push(this._totalBases);
            this._totalBases += feature.getLength();
            i++;
        }
    }

    /**
     * @return {string} this navigation context's name, as specified in the constructor
     */
    getName() {
        return this._name;
    }

    /**
     * Gets the internal feature list.  This list should be treated as read-only; modifying its elements causes
     * undefined behavior.
     * 
     * @return {Feature[]} the internal feature list for this context
     */
    getFeatures() {
        return this._features.slice();
    }

    /**
     * @return {number} the total number of bases in this context, i.e. how many bases are navigable
     */
    getTotalBases() {
        return this._totalBases;
    }

    /**
     * Given a context coordinate, gets whether the base is navigable.
     * 
     * @param {number} base - context coordinate
     * @return {boolean} whether the base is navigable
     */
    getIsValidBase(base: number): boolean {
        return 0 <= base && base < this._totalBases;
    }

    /**
     * Gets the context coordinate of a feature's start, given the feature's name.  Throws an error if the feature
     * cannot be found.
     * 
     * @param {string} name - the feature's name
     * @return {number} the context coordinate of the feature's start
     * @throws {RangeError} if the feature's name is not in this context
     */
    getFeatureStart(name: string): number {
        const index = this._indexForFeatureName[name];
        if (index === undefined) {
            throw new RangeError(`Cannot find feature with name '${name}'`);
        }
        return this._startCoordinateForFeatureIndex[index];
    }

    /**
     * Given a context coordinate, gets the feature in which it is located.  Returns a FeatureSegment that expresses
     * a base number relative to the feature's start.
     *
     * @param {number} base - the context coordinate to look up
     * @return {FeatureSegment} corresponding feature coordinate
     * @throws {RangeError} if the base is not in this context
     */
    convertBaseToFeatureCoordinate(base: number): FeatureSegment {
        if (!this.getIsValidBase(base)) {
            throw new RangeError("Invalid base number");
        }

        let index = this._features.length - 1; // We want the index of the feature that contains the context coordinate.
        // It's ok to subtract 1 since there must be at least one feature, guaranteed by the constructor.
        // Last feature (highest base #) to first (lowest base #)
        while (index > 0 && base < this._startCoordinateForFeatureIndex[index]) {
            index--;
        }
        const feature = this._features[index];
        const coordinate = base - this._startCoordinateForFeatureIndex[index];
        return new FeatureSegment(feature, coordinate, coordinate);
    }

    /**
     * Given a feature name and base number relative to the feature's start *indexed from 0*, finds the context
     * coordinate in this navigation context.
     *
     * @param {string} featureName - name of the feature to look up
     * @param {number} baseNum - base number relative to feature's start
     * @return {number} the context coordinate
     * @throws {RangeError} if the feature name or its relative base is not in this context
     */
    convertFeatureCoordinateToBase(queryName: string, base: number): number {
        const index = this._indexForFeatureName[queryName];
        if (index === undefined) {
            throw new RangeError(`Cannot find feature with name '${queryName}'`);
        }
        const feature = this._features[index];
        const contextStart = this._startCoordinateForFeatureIndex[index];

        if (0 <= base && base <= feature.getLength()) {
            return contextStart + base;
        } else {
            throw new RangeError(`Base number '${base}' not in feature '${queryName}'`);
        }
    }

    /**
     * Converts genome coordinates to an interval of context coordinates.  Since coordinates can map
     * to multiple features, or none at all, this method returns a list of OpenInterval.
     * 
     * @param {ChromosomeInterval} chrInterval - genome interval
     * @return {OpenInterval[]} intervals of context coordinates
     */
    convertGenomeIntervalToBases(chrInterval: ChromosomeInterval): OpenInterval[] {
        if (this._isGenome) {
            return [new OpenInterval(
                this.convertFeatureCoordinateToBase(chrInterval.chr, chrInterval.start),
                this.convertFeatureCoordinateToBase(chrInterval.chr, chrInterval.end),
            )];
        }
        const potentialOverlaps = this._featuresForChr[chrInterval.chr] || [];
        const contextIntervals = [];
        for (const feature of potentialOverlaps) {
            const overlap = new FeatureSegment(feature).getOverlap(chrInterval);
            if (overlap) {
                const start = this.convertFeatureCoordinateToBase(feature.getName(), overlap.relativeStart);
                const end = this.convertFeatureCoordinateToBase(feature.getName(), overlap.relativeEnd);
                contextIntervals.push(new OpenInterval(start, end));
            }
        }
        return contextIntervals;
    }

    /**
     * Parses an interval in this navigation context.  Should be formatted like "$featureName:$startBase-$endBase" OR
     * "$featureName:$startBase-$featureName2:$endBase".  This format corresponds to UCSC-style chromosomal ranges, like
     * "chr1:1000-chr2:1000", **except that we expect 0-indexed intervals**.
     * 
     * Returns an open interval of context coordinates.  Throws RangeError on parse failure.
     *
     * @param {string} str - the string to parse
     * @return {OpenInterval} the context coordinates represented by the string
     * @throws {RangeError} when parsing an interval outside of the context or something otherwise nonsensical
     */
    parse(str: string): OpenInterval {
        let startName, endName, startBase, endBase;
        let singleFeatureMatch, multiFeatureMatch;
        // eslint-disable-next-line no-cond-assign
        singleFeatureMatch = str.match(/([\w:]+):(\d+)-(\d+)/);
        multiFeatureMatch = str.match(/([\w:]+):(\d+)-([\w:]+):(\d+)/);
        if ((singleFeatureMatch) !== null) {
            startName = singleFeatureMatch[1];
            endName = startName;
            startBase = Number.parseInt(singleFeatureMatch[2], 10);
            endBase = Number.parseInt(singleFeatureMatch[3], 10);
        // eslint-disable-next-line no-cond-assign
        } else if ((multiFeatureMatch) !== null) {
            startName = multiFeatureMatch[1];
            endName = multiFeatureMatch[3];
            startBase = Number.parseInt(multiFeatureMatch[2], 10);
            endBase = Number.parseInt(multiFeatureMatch[4], 10);
        } else {
            throw new RangeError("Wrong coordinates");
        }

        const startCoordinate = this.convertFeatureCoordinateToBase(startName, startBase);
        const endCoordinate = this.convertFeatureCoordinateToBase(endName, endBase);
        if (startCoordinate < endCoordinate) {
            return new OpenInterval(startCoordinate, endCoordinate);
        } else {
            throw new RangeError("Start must be before end");
        }
    }

    /**
     * Queries features that overlap an open interval of context coordinates.  Returns a list of FeatureSegment.
     * 
     * @param {number} queryStart - (inclusive) start of interval, as a context coordinate
     * @param {number} queryEnd - (exclusive) end of interval, as a context coordinate
     * @return {FeatureSegment[]} list of feature intervals
     */
    getFeaturesInInterval(queryStart: number, queryEnd: number): FeatureSegment[] {
        const queryInterval = new OpenInterval(queryStart, queryEnd);
        const results = []
        for (let i = 0; i < this._features.length; i++) { // Check each feature for overlap with the query interval
            const feature = this._features[i];
            const start = this._startCoordinateForFeatureIndex[i];
            const end = start + feature.getLength(); // Noninclusive
            const overlap = new OpenInterval(start, end).getOverlap(queryInterval);

            if (overlap) {
                const relativeStart = overlap.start - start;
                const relativeEnd = overlap.end - start
                results.push(new FeatureSegment(feature, relativeStart, relativeEnd));
            } else if (results.length > 0) { // No overlap
                // Since features are sorted by start, we can be confident that there will be no more overlaps if we
                // have seen overlaps before.
                break;
            }
        }
        return results;
    }

    /**
     * Queries genomic locations that overlap an open interval of context coordinates.  The results are guaranteed to
     * not overlap each other.
     * 
     * @param {number} queryStart - (inclusive) start of interval, as a context coordinate
     * @param {number} queryEnd - (exclusive) end of interval, as a context coordinate
     * @return {ChromosomeInterval[]} list of genomic locations
     */
    getLociInInterval(queryStart: number, queryEnd: number) {
        const featureSegments = this.getFeaturesInInterval(queryStart, queryEnd);
        const loci = featureSegments.map(interval => interval.getGenomeCoordinates());
        // Remove gaps: this works since we defined the gap feature as one with an empty chromosome name
        const validLoci = loci.filter(locus => locus.chr);
        return ChromosomeInterval.mergeOverlaps(validLoci);
    }
}

export default NavigationContext;
