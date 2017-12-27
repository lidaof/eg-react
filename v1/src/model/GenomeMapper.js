import Feature from './Feature';

/**
 * Class that looks up the genomic coordinates of features, and the inverse.
 * 
 * @author Silas Hsu
 */
export class GenomeMap { // Exported for testing purposes
    /**
     * Make a new mapping from genomic features to the genome, and the inverse.  Features must have a `chr` prop in
     * their details which matches the names of the chromosomes (Features) in the genome.
     * 
     * @param {NavigationContext} context - context to map to the genome
     * @param {NavigationContext} genome - the genome; the context storing chromosomes
     */
    constructor(context, genome) {
        // We take advantage of the guarantee that segments in NavigationContexts have non-empty, unique names.
        const features = context.getSegments();

        let chrNameToChromosome = {}
        for (let chr of genome.getSegments()) {
            chrNameToChromosome[chr.getName()] = chr;
        }

        let featureNameToFeature = {};
        for (const feature of features) {
            featureNameToFeature[feature.getName()] = feature;

            const chr = feature.getDetails().chr;
            if (!chrNameToChromosome[chr]) {
                throw new Error(`Feature "${feature.getName()}" has unknown chromosome "${chr}"`);
            }
        }

        this._featureNameToFeature = featureNameToFeature;
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
            console.warn(`"${queryInterval.getName()}" not in this mapping`);
            return null;
        }
        // Guaranteed to exist; we made sure in constructor
        const chrObj = this._chrNameToChromosome[knownFeature.getDetails().chr];

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
     * @param {string} featureName
     * @return {Feature} intersection of a feature with the genomic interval
     */
    mapFromGenome(chromosomeInterval, featureName) {
        const feature = this._featureNameToFeature[featureName]
        if (!feature) {
            console.warn(`Feature ${featureName} not in this mapping`);
            return null;
        }

        const [featureStart, featureEnd] = feature.get0Indexed();
        const intersectionStart = Math.max(featureStart, chromosomeInterval.get0Indexed().start);
        const intersectionEnd = Math.min(featureEnd, chromosomeInterval.get0Indexed().end);
        if (intersectionStart < intersectionEnd) { // The feature intersects with the chromosome interval!
            // We have to make sure the resulting interval's start and end are relative to the feature's start
            const start = intersectionStart - featureStart;
            const end = intersectionEnd - featureStart;
            return new Feature(feature, start, end, true);
        }

        return null;
    }
}

/**
 * Factory that makes GenomeMaps.
 */
export class GenomeMapper {
    /**
     * Makes a new GenomeMapper that maps other contexts to the target NavigationContext
     * 
     * @param {NavigationContext} genome - target NavigationContext
     */
    constructor(genome) {
        this.genome = genome;
    }

    /**
     * Makes a new GenomeMap that maps from the input context to the genome
     * 
     * @param {NavigationContext} context - context from which to map
     */
    makeMapToGenome(context) {
        return new GenomeMap(context, this.genome);
    }
}

export default GenomeMapper;
