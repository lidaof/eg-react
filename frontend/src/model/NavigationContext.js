import _ from 'lodash';
import OpenInterval from './interval/OpenInterval';
import FeatureInterval from './interval/FeatureInterval';
import ChromosomeInterval from './interval/ChromosomeInterval';

/**
 * An object that represents everywhere that a user could potentially navigate and view.  A context is actually an
 * ordered list of features.  Features in NavigationContexts must have non-empty, unique names.  There are two ways to
 * represent coordinates:
 * 
 * 1.  Absolute coordinates, which are base numbers starting from 0.
 * 2.  Feature coordinates, which are a feature and base number relative to the start of the feature.
 * 
 * @author Silas Hsu
 */
class NavigationContext {
    /**
     * Makes a new instance.  Features must have non-empty, unique names.  The `isGenome` parameter does not change any
     * of the instance's functionality, but if it is true, it optimizes mapping functions.
     * 
     * @param {string} name - name of this context
     * @param {Feature[]} features - list of features
     * @param {boolean} isGenome - whether the context covers the entire genome
     * @throws {Error} if the feature list has a problem
     */
    constructor(name, features, isGenome=false) {
        this._name = name;
        this._features = features;
        this._isGenome = isGenome;
        this._featureStarts = [];
        this._featureNameToIndex = {};
        this._chrToFeatures = _.groupBy(features, feature => feature.getLocus().chr)
        this._totalBases = 0;

        let i = 0;
        for (let feature of features) {
            // Make sure names are unique
            const name = feature.getName();
            if (!name) {
                throw new Error("All features must have names");
            }
            if (this._featureNameToIndex[name] !== undefined) {
                throw new Error(`Duplicate name ${name} detected; features must have unique names.`);
            }
            this._featureNameToIndex[name] = i;

            // Add to feature list w/ additional details
            this._featureStarts.push(this._totalBases);
            this._totalBases += feature.getLength();
            i++;
        }

        if (this._totalBases === 0) {
            throw new Error("Context has 0 length");
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
     * Given an absolute coordinate, gets whether the base is navigable.
     * 
     * @param {number} base - absolute coordinate
     * @return {boolean} whether the base is navigable
     */
    getIsValidBase(base) {
        return 0 <= base && base < this._totalBases;
    }

    /**
     * Gets the absolute coordinate of a feature's start, given the feature's name.  Throws an error if the feature
     * cannot be found.
     * 
     * @param {string} name - the feature's name
     * @return {number} the absolute coordinate of the feature's start
     * @throws {RangeError} if the feature's name is not in this context
     */
    getFeatureStart(name) {
        const index = this._featureNameToIndex[name];
        if (index === undefined) {
            throw new RangeError(`Cannot find feature with name '${name}'`);
        }
        return this._featureStarts[index];
    }

    /**
     * Given an absolute coordinate, gets the feature in which it is located.  Returns a FeatureInterval that expresses
     * a base number relative to the feature's start.
     *
     * @param {number} base - the absolute coordinate to look up
     * @return {FeatureInterval} corresponding feature coordinate
     * @throws {RangeError} if the absolute base is not in this context
     */
    convertBaseToFeatureCoordinate(base) {
        if (!this.getIsValidBase(base)) {
            throw new RangeError("Invalid base number");
        }

        let index = this._features.length - 1; // We want the index of the feature that contains the absolute base.
        // It's ok to subtract 1 since there must be at least one feature, guaranteed by the constructor.
        // Last feature (highest base #) to first (lowest base #)
        while (index > 0 && base < this._featureStarts[index]) {
            index--;
        }
        const feature = this._features[index];
        const coordinate = base - this._featureStarts[index];
        return new FeatureInterval(feature, coordinate, coordinate);
    }

    /**
     * Given a feature name and base number relative to the feature's start *indexed from 0*, finds the absolute
     * coordinate in this navigation context.
     *
     * @param {string} featureName - name of the feature to look up
     * @param {number} baseNum - base number relative to feature's start
     * @return {number} the absolute base in this context
     * @throws {RangeError} if the feature name or its relative base is not in this context
     */
    convertFeatureCoordinateToBase(queryName, base) {
        const index = this._featureNameToIndex[queryName];
        if (index === undefined) {
            throw new RangeError(`Cannot find feature with name '${queryName}'`);
        }
        const feature = this._features[index];
        const absStart = this._featureStarts[index];

        if (0 <= base && base <= feature.getLength()) {
            return absStart + base;
        } else {
            throw new RangeError(`Base number '${base}' not in feature '${queryName}'`);
        }
    }

    /**
     * Converts genome coordinates to an interval of absolute base numbers in this context.  Since coordinates can map
     * to multiple features, or none at all, this method returns a list of OpenInterval.
     * 
     * @param {ChromosomeInterval} chrInterval - genome interval
     * @return {OpenInterval[]} intervals of absolute base numbers in this context
     */
    convertGenomeIntervalToBases(chrInterval) {
        if (this._isGenome) {
            return [new OpenInterval(
                this.convertFeatureCoordinateToBase(chrInterval.chr, chrInterval.start),
                this.convertFeatureCoordinateToBase(chrInterval.chr, chrInterval.end),
            )];
        }
        const potentialOverlaps = this._chrToFeatures[chrInterval.chr] || [];
        let absLocations = [];
        for (let feature of potentialOverlaps) {
            const overlap = new FeatureInterval(feature).getOverlap(chrInterval);
            if (overlap) {
                const absStart = this.convertFeatureCoordinateToBase(feature.getName(), overlap.relativeStart);
                const absEnd = this.convertFeatureCoordinateToBase(feature.getName(), overlap.relativeEnd);
                absLocations.push(new OpenInterval(absStart, absEnd));
            }
        }
        return absLocations;
    }

    /**
     * Parses an interval in this navigation context.  Should be formatted like "$featureName:$startBase-$endBase" OR
     * "$featureName:$startBase-$featureName2:$endBase".  This format corresponds to UCSC-style chromosomal ranges, like
     * "chr1:1000-chr2:1000", **except that we expect 0-indexed intervals**.
     * 
     * Returns an open interval of absolute coordinates.  Throws RangeError on parse failure.
     *
     * @param {string} str - the string to parse
     * @return {OpenInterval} the parsed absolute interval
     * @throws {RangeError} when parsing an interval outside of the context or something otherwise nonsensical
     */
    parse(str) {
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

        let startAbsBase = this.convertFeatureCoordinateToBase(startName, startBase, true);
        let endAbsBase = this.convertFeatureCoordinateToBase(endName, endBase, true);
        if (startAbsBase < endAbsBase) {
            return new OpenInterval(startAbsBase, endAbsBase);
        } else {
            throw new RangeError("Start must be before end");
        }
    }

    /**
     * Queries features that overlap an open interval of absolute coordinates.  Returns a list of FeatureInterval.
     * 
     * @param {number} queryStart - (inclusive) start of interval, as an absolute coordinate
     * @param {number} queryEnd - (exclusive) end of interval, as an absolute coordinate
     * @return {FeatureInterval[]} list of feature intervals
     */
    getFeaturesInInterval(queryStart, queryEnd) {
        const queryInterval = new OpenInterval(queryStart, queryEnd);
        let results = []
        for (let i = 0; i < this._features.length; i++) { // Check each feature for overlap with the query interval
            const feature = this._features[i];
            const absStart = this._featureStarts[i];
            const absEnd = absStart + feature.getLength(); // Noninclusive
            const overlap = new OpenInterval(absStart, absEnd).getOverlap(queryInterval);

            if (overlap) {
                const relativeStart = overlap.start - absStart;
                const relativeEnd = overlap.end - absStart
                results.push(new FeatureInterval(feature, relativeStart, relativeEnd));
            } else if (results.length > 0) { // No overlap
                // Since features are sorted by absolute start, we can be confident that there will be no more overlaps
                // if we have seen some before.
                break;
            }
        }
        return results;
    }

    /**
     * Queries genomic locations that overlap an open interval of absolute coordinates.  The results are guaranteed to
     * not overlap each other.
     * 
     * @param {number} queryStart - (inclusive) start of interval, as an absolute coordinate
     * @param {number} queryEnd - (exclusive) end of interval, as an absolute coordinate
     * @return {ChromosomeInterval[]} list of genomic locations
     */
    getLociInInterval(queryStart, queryEnd) {
        const featureIntervals = this.getFeaturesInInterval(queryStart, queryEnd);
        const genomeIntervals = featureIntervals.map(interval => interval.getGenomeCoordinates());
        return ChromosomeInterval.mergeOverlaps(genomeIntervals);
    }
}

export default NavigationContext;
