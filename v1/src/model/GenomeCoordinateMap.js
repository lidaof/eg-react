import SegmentInterval from './SegmentInterval';

/**
 * Class that looks up the genomic coordinates of arbitrarily-named features, and the inverse.
 * 
 * @author Silas Hsu
 */
class GenomeCoordinateMap {
    /**
     * Make a new mapping from genomic features to the genome, and the inverse.  Object is `features` must contain name
     * and chromosome info for the mapping to work properly.  
     * 
     * @param {Object[]} features - array of features to map
     * @param {NavigationContext} genome - NavigationContext where each segment is a chromosome
     */
    constructor(features, genome) {
        const chrNames = new Set(genome.getSegments().map(chromosome => chromosome.name));
        let nameToFeature = {};

        // This loop not only populates nameToFeature, but also warns if objects in `features` are missing props
        for (const feature of features) { 
            const name = feature.name || feature.details.name;
            if (name) {
                if (nameToFeature[name] !== undefined) {
                    console.warn("A feature with a duplicate name found; mapping will only include the lastest one.");
                }
                nameToFeature[name] = feature;
            } else {
                console.warn("A feature is missing its name.  Mapping will exclude this feature.");
            }

            const chr = feature.chromosome || feature.chr;
            if (!chrNames.has(chr)) {
                console.warn(`A feature has a unknown chromosome "${chr}".  Mapping will exclude this feature.`);
            }
        }

        let chromosomeToFeatures = {};
        for (const chr of chrNames) {
            chromosomeToFeatures[chr] = features.filter(feature => {
                return feature.chromosome === chr || feature.chr === chr;
            });
        }

        this._features = features;
        this._nameToFeature = nameToFeature;
        this._chromosomeToFeatures = chromosomeToFeatures;
        this._genome = genome;
    }

    /**
     * Gets the actual genetic coordinates of a segment.  Relies on the input segment's name to do the mapping; thus,
     * the segment's name must match one of the features that were given during this object's construction.
     * 
     * @param {SegmentInterval} segmentInterval - the interval to map
     * @return {SegmentInterval} the actual genetic coordinates of the interval.  If not found, returns null.
     */
    getGenomeInterval(segmentInterval) {
        const matchingFeature = this._nameToFeature[segmentInterval.name];
        if (!matchingFeature) {
            return null;
        }

        const chrName = matchingFeature.chromosome || matchingFeature.chr;
        const chrObj = this._genome.getSegments().find(chromosome => chromosome.name === chrName);
        if (!chrObj) {
            return null;
        }

        // Segment start and end are relative to the start of the feature
        return new SegmentInterval(
            chrObj,
            matchingFeature.start + segmentInterval.start - 1, 
            matchingFeature.start + segmentInterval.end - 1
        );
    }

    /**
     * TODO
     * 
     * @param {SegmentInterval} chromosomeInterval 
     * @return {SegmentInterval}
     */
    getSegmentInterval(chromosomeInterval) {
        // TODO if we want to do this efficiently, we should use something like a interval tree.  But for now,
        // we will use a brute-force search.
        let possibleFeatures = this._chromosomeToFeatures[chromosomeInterval.name];
        if (!possibleFeatures) {
            return null;
        }

        for (let feature of possibleFeatures) {
            let intersectionStart = Math.max(feature.start, chromosomeInterval.start);
            let intersectionEnd = Math.min(feature.end, chromosomeInterval.end);
            if (intersectionStart <= intersectionEnd) { // The feature intersects with the chromosome interval!
                // We have to make sure the resulting interval's start and end are relative to the feature's start
                let start = intersectionStart - feature.start + 1; // +1 because intervals index from 1
                let end = intersectionEnd - feature.start; // Not +1 because inclusive interval
                return new SegmentInterval(feature, start, end);
            }
        }
        return null;
    }
}

export default GenomeCoordinateMap;
