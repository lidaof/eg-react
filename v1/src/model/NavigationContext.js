import OpenInterval from './interval/OpenInterval';
import FeatureInterval from './interval/FeatureInterval';

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
     * Makes a new instance.  Features must have non-empty, unique names.
     * 
     * @param {string} name - name of this context
     * @param {Feature[]} features - list of features
     * @throws {Error} if the feature list has a problem
     */
    constructor(name, features) {
        this._name = name;
        this._features = features;
        this._featureStarts = [];
        this._featureNameToIndex = {};

        let totalBases = 0;
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
            this._featureStarts.push(totalBases);
            totalBases += feature.getLength();
            i++;
        }
        this._totalBases = totalBases;
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
     * Queries the context for a feature with a certain name.  Throws an error if the feature cannot be found.
     * 
     * @param {string} name - name of the feature to look up
     * @return {Feature} the found feature
     * @throws {RangeError} if the feature's name is not in this context
     */
    getFeatureWithName(name) {
        const index = this._featureNameToIndex[name];
        if (index === undefined) {
            throw new RangeError(`Cannot find feature with name '${name}'`);
        }
        return this._features[index];
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
     * Given an absolute coordinate, gets the index of the feature in which the base is located.
     *
     * @param {number} base - the absolute coordinate to look up
     * @return {number} index of feature
     * @throws {RangeError} if the base is invalid
     */
    convertBaseToFeatureIndex(base) {
        if (!this.getIsValidBase(base)) {
            throw new RangeError("Invalid base number");
        }
        // Last feature (highest base #) to first (lowest base #)
        for (let i = this._featureStarts.length - 1; i > 0; i--) {
            if (base >= this._featureStarts[i]) {
                return i;
            }
        }
        return 0;
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
        const index = this.convertBaseToFeatureIndex(base); // Can throw RangeError
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
     * to multiple features, this method also needs a target feature or FeatureInterval.  By default, this method uses
     * the chromosome's name as the feature name, but the second parameter can override this behavior.
     * 
     * @param {ChromosomeInterval} chrInterval - genome interval
     * @param {string | Feature | FeatureInterval} [targetFeature] - target location in context to map to
     * @return {OpenInterval} interval of absolute base numbers in this context
     * @throws {RangeError} if the feature does not exist in this context
     */
    convertGenomeIntervalToBases(chrInterval, targetFeature) {
        let feature;
        if (!targetFeature) {
            feature = this.getFeatureWithName(chrInterval.chr);
        } else if (typeof targetFeature === "string") {
            feature = this.getFeatureWithName(targetFeature);
        } else { // Assume Feature
            feature = targetFeature;
        }

        const overlap = new FeatureInterval(feature).getOverlap(chrInterval);
        if (!overlap) {
            return null;
        }
        
        return new OpenInterval(
            this.convertFeatureCoordinateToBase(feature.getName(), overlap.relativeStart),
            this.convertFeatureCoordinateToBase(feature.getName(), overlap.relativeEnd)
        );
    }

    /**
     * Parses an interval in this navigation context.  Should be formatted like "$featureName:$startBase-$endBase" OR
     * "$featureName:$startBase-$featureName2:$endBase".  This format corresponds to UCSC-style chromosomal ranges, like
     * "chr1:1000-chr2:1000", **except that we expect 0-indexed intervals**.
     * 
     * Returns an open interval of absolute coordinates.  Throws RangeError on parse failure.
     *
     * @param {string} string - the string to parse
     * @return {OpenInterval} the parsed absolute interval
     * @throws {RangeError} when parsing an interval outside of the context or something otherwise nonsensical
     */
    parse(string) {
        let startName, endName, startBase, endBase;
        let singleFeatureMatch, multiFeatureMatch;
        // eslint-disable-next-line no-cond-assign
        if ((singleFeatureMatch = string.match(/([\w:]+):(\d+)-(\d+)/)) !== null) {
            startName = singleFeatureMatch[1];
            endName = startName;
            startBase = Number.parseInt(singleFeatureMatch[2], 10);
            endBase = Number.parseInt(singleFeatureMatch[3], 10);
        // eslint-disable-next-line no-cond-assign
        } else if ((multiFeatureMatch = string.match(/([\w:]+):(\d+)-([\w:]+):(\d+)/)) !== null) {
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
        const overlappingFeatures = []; // Construct overlapping feature list; it will be sorted left to right.
        const overlappingFeatureStarts = [];
        for (let i = 0; i < this._features.length; i++) {
            const feature = this._features[i];
            const featureStart = this._featureStarts[i];
            const featureEnd = featureStart + feature.getLength(); // Noninclusive
            /*
             * You can convince yourself this is correct by considering three cases:
             *  - the query overlaps the feature on the left side
             *  - the query is entirely inside the feature
             *  - the query overlaps the feature on the right side
             */
            if (queryStart < featureEnd && featureStart < queryEnd) { 
                overlappingFeatures.push(feature);
                overlappingFeatureStarts.push(featureStart);
            }
        }

        const leftFeature = overlappingFeatures[0];
        const rightFeature = overlappingFeatures[overlappingFeatures.length - 1];
        const leftFeatureStart = queryStart - overlappingFeatureStarts[0];
        const rightFeatureEnd = queryEnd - overlappingFeatureStarts[overlappingFeatures.length - 1];

        if (overlappingFeatures.length === 1) {
            return [new FeatureInterval(leftFeature, leftFeatureStart, rightFeatureEnd)];
        }

        let result = [];
        result.push(new FeatureInterval(leftFeature, leftFeatureStart, leftFeature.getLength()));
        for (let i = 1; i < overlappingFeatures.length - 1; i++) {
            let feature = overlappingFeatures[i];
            result.push(new FeatureInterval(feature, 0, feature.getLength()));
        }
        result.push(new FeatureInterval(rightFeature, 0, rightFeatureEnd));

        return result;
    }
}

export default NavigationContext;
