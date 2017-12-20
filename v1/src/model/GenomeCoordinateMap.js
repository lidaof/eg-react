import Feature from './Feature';

/**
 * Class that looks up the genomic coordinates of features, and the inverse.
 * 
 * @author Silas Hsu
 */
class GenomeCoordinateMap {
    /**
     * Make a new mapping from genomic features to the genome, and the inverse.  Features must have a `chr` prop in
     * their details which matches the names of the Features in the genome.
     * 
     * @param {Feature[]} features - array of Feature to map to the genome
     * @param {Feature[]} chromosomes - the genome; array of Feature storing chromosomes
     */
    constructor(features, genome) {
        let chrNameToChromosome = {}
        for (let chr of genome) {
            chrNameToChromosome[chr.getName()] = chr;
        }
        let featureNameToFeature = {};

        // This loop not only populates nameToFeature, but also warns if objects in `features` are missing props
        for (const feature of features) { 
            const name = feature.getName();
            if (name) {
                if (featureNameToFeature[name] !== undefined) {
                    console.warn(`Feature with duplicate name ${name} found; only the latest one will be mapped`);
                }
                featureNameToFeature[name] = feature;
            } else {
                console.warn("A feature is missing its name.  Mapping will exclude this feature.");
            }

            const chr = feature.details.chr;
            if (!chrNameToChromosome[chr]) {
                console.warn(`A feature has a unknown chromosome "${chr}".  Mapping will exclude this feature.`);
            }
        }

        let chrNameToFeatures = {};
        for (const chr in chrNameToChromosome) {
            chrNameToFeatures[chr] = features.filter(feature => {
                return feature.details.chr === chr;
            });
        }

        this._featureNameToFeature = featureNameToFeature;
        this._chromosomeToFeatures = chrNameToFeatures;
        this._chrNameToChromosome = chrNameToChromosome;
    }

    /**
     * Gets the genetic coordinates of a segment interval (segment + coordinates relative to the segment's start).
     * Relies on the input segment's name to do the mapping; thus, the segment's name must match one of the features
     * that were given during this object's construction.
     * 
     * @param {Feature} queryInterval - the interval to map
     * @return {Feature} the actual genetic coordinates of the interval.  If not found, returns null.
     */
    mapToGenome(queryInterval) {
        // Find a feature which matches the query interval.  We know the matching feature's genomic coordinates. 
        const knownFeature = this._featureNameToFeature[queryInterval.getName()];
        if (!knownFeature) {
            return null;
        }

        const chrObj = this._chrNameToChromosome[knownFeature.details.chr];
        if (!chrObj) {
            return null;
        }

        const relativeStart = knownFeature.get0Indexed().start + queryInterval.get0Indexed().start;
        const relativeEnd = knownFeature.get0Indexed().start + queryInterval.get0Indexed().end;
        // Segment start and end are relative to the start of the feature
        return new Feature(chrObj, relativeStart, relativeEnd, true);
    }

    /**
     * Maps a chromosome interval to a feature interval (feature + coordinates relative to the feature's start).  The
     * input genomic interval's name must match a chromosome's name.  If multiple features overlap with the chromosome
     * interval, then only the first overlapping feature is returned.  Returns null if mapping fails.
     * 
     * @param {Feature} chromosomeInterval - the genomic interval to map to a feature interval
     * @return {Feature} intersection of a feature with the genomic interval
     */
    mapFromGenome(chromosomeInterval) {
        let possibleFeatures = this._chromosomeToFeatures[chromosomeInterval.getName()];
        if (!possibleFeatures) {
            return null;
        }

        // TODO if we want to do this efficiently, we should use something like a interval tree.  But for now,
        // we will use a brute-force search.
        for (let feature of possibleFeatures) {
            const [featureStart, featureEnd] = feature.get0Indexed();
            let intersectionStart = Math.max(featureStart, chromosomeInterval.get0Indexed().start);
            let intersectionEnd = Math.min(featureEnd, chromosomeInterval.get0Indexed().end);
            if (intersectionStart < intersectionEnd) { // The feature intersects with the chromosome interval!
                // We have to make sure the resulting interval's start and end are relative to the feature's start
                let start = intersectionStart - featureStart;
                let end = intersectionEnd - featureStart;
                return new Feature(feature, start, end, true);
            }
        }
        return null;
    }
}

export default GenomeCoordinateMap;
