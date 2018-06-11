import _ from 'lodash';
import Feature, { IFeature } from './Feature';
import NavigationContext from './NavigationContext';
import FlankingStrategy, { IFlankingStrategy } from './FlankingStrategy';
import { getGenomeConfig } from './genomes/allGenomes';
import { Genome } from './genomes/Genome';

/**
 * A RegionSet without methods.
 */
interface IRegionSet {
    name: string;
    features: IFeature[];
    genomeName: string;
    flankingStrategy: IFlankingStrategy;
}

/**
 * A set of features that undergoes some configuration before being exported to a navigation context.
 * 
 * @implements {Serializable}
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
    constructor(public name="", public features: Feature[]=[], public genome: Genome,
        public flankingStrategy: FlankingStrategy)
    {
        this.name = name;
        this.features = features;
        this.genome = genome;
        this.flankingStrategy = flankingStrategy;
    }

    serialize(): IRegionSet {
        return {
            name: this.name,
            features: this.features.map(feature => feature.serialize()),
            genomeName: this.genome.getName(),
            flankingStrategy: this.flankingStrategy.serialize()
        }
    }

    static deserialize(object: IRegionSet): RegionSet {
        const genomeName = object.genomeName;
        const genomeConfig = getGenomeConfig(genomeName);
        if (!genomeConfig) {
            throw new Error(`Cannot deserialize RegionSet object due to unknown genome name ${genomeName}`);
        }
        return new RegionSet(
            object.name,
            object.features.map(Feature.deserialize),
            genomeConfig.genome,
            FlankingStrategy.deserialize(object.flankingStrategy)
        );
    }

    /**
     * Shallowly clones this, sets a prop to a value, and returns the result.
     * 
     * @param {string} propName - the prop to set
     * @param {any} value - the value to set
     * @return {RegionSet} cloned and modified version of this
     */
    cloneAndSet(propName: string, value: any): RegionSet {
        const newSet = _.clone(this);
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
    cloneAndAddFeature(feature: Feature): RegionSet {
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

        const newFeatures = this.features.slice();
        newFeatures.push(feature);
        return this.cloneAndSet("features", newFeatures);
    }

    /**
     * Clones this, and then deletes a feature from this set.
     * 
     * @param {number} index - index of the feature to delete
     * @return {RegionSet} cloned and modified version of this
     */
    cloneAndDeleteFeature(index: number): RegionSet {
        const newFeatures = this.features.slice();
        newFeatures.splice(index, 1);
        return this.cloneAndSet("features", newFeatures);
    }

    /**
     * Uses the associated FlankingStrategy to return a list of features originating from the features in this set.
     * 
     * @return {Feature[]} list of flanked features
     */
    makeFlankedFeatures(): Feature[] {
        return this.features.map(feature => this.flankingStrategy.makeFlankedFeature(feature, this.genome));
    }

    /**
     * Equivalent to calling {@link makeFlankedFeatures()} and then making a navigation context out of them.
     * 
     * @return {NavigationContext} - navigation context from flanked features
     */
    makeNavContext(): NavigationContext {
        const flankedFeatures = this.makeFlankedFeatures();
        if (flankedFeatures.some(feature => feature === null)) {
            throw new Error("Cannot make nav context out of null features.  Double check the flanking strategy.");
        }
        return new NavigationContext(this.name, flankedFeatures);
    }
}

export default RegionSet;
