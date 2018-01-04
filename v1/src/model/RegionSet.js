import _ from 'lodash';
import NavigationContext from './NavigationContext';

/**
 * A set of features that undergoes some configuration before being exported to a navigation context.
 * 
 * @author Silas Hsu
 */
class RegionSet {
    static MIN_REGION_LENGTH = 100;

    /**
     * Makes a new instance.  The flankingStrategy parameter is used to modify all features before constructing a
     * NavigationContext.
     * 
     * @param {string} [name] - name of this region set
     * @param {Feature[]} [features] - list of features in this set
     * @param {Genome} genome - genome to which the features belong
     * @param {FlankingStrategy} flankingStrategy - feature modifier
     */
    constructor(name="", features=[], genome, flankingStrategy) {
        this.name = name;
        this.features = features;
        this.genome = genome;
        this.flankingStrategy = flankingStrategy;
    }

    /**
     * Shallowly clones this, sets a prop to a value, and returns the result.
     * 
     * @param {string} propName - the prop to set
     * @param {any} value - the value to set
     * @return {RegionSet} cloned and modified version of this
     */
    cloneAndSet(propName, value) {
        let newSet = _.clone(this);
        newSet[propName] = value;
        return newSet;
    }

    /**
     * Clones this, and then adds a new feature to this set.  Features must have a valid name, and be in the genome;
     * otherwise, an error will result.
     * 
     * @param {Feature} feature - the feature to add
     * @return {RegionSet} cloned and modified version of this
     * @throws {RangeError} if the input feature is invalid in some way
     */
    cloneAndAddFeature(feature) {
        if (!feature.getName()) {
            throw new RangeError("Feature must have a name");
        }
        const featureNames = new Set(this.features.map(feature => feature.getName()));
        if (featureNames.has(feature.getName())) {
            throw new RangeError("No duplicate feature names allowed");
        }

        const genomeIntersection = this.genome.intersectInterval(feature.getLocus());
        if (!genomeIntersection || genomeIntersection.getLength() < RegionSet.MIN_REGION_LENGTH) {
            throw new RangeError("Feature not in genome or is too short");
        }

        let newFeatures = this.features.slice();
        newFeatures.push(feature);
        return this.cloneAndSet("features", newFeatures);
    }

    /**
     * Clones this, and then deletes a feature from this set.
     * 
     * @param {number} index - index of the feature to delete
     * @return {RegionSet} cloned and modified version of this
     */
    cloneAndDeleteFeature(index) {
        let newFeatures = this.features.slice();
        newFeatures.splice(index, 1);
        return this.cloneAndSet("features", newFeatures);
    }

    /**
     * Uses the associated FlankingStrategy to return a list of features originating from the features in this set.
     * 
     * @return {Feature[]} list of flanked features
     */
    makeFlankedFeatures() {
        return this.features.map(feature => this.flankingStrategy.makeFlankedFeature(feature, this.genome));
    }

    /**
     * Equivalent to calling {@link makeFlankedFeatures()} and then making a navigation context out of them.
     * 
     * @return {NavigationContext} - navigation context from flanked features
     */
    makeNavContext() {
        const flankedFeatures = this.makeFlankedFeatures();
        return new NavigationContext(this.name, flankedFeatures);
    }
}

export default RegionSet;
