import _ from 'lodash';
import NavigationContext from './NavigationContext';

class RegionSet {
    static MIN_REGION_LENGTH = 100;

    constructor(name="", features=[], genome, flankingStrategy) {
        this.name = name;
        this.features = features;
        this.genome = genome;
        this.flankingStrategy = flankingStrategy;
    }

    cloneAndSet(propName, value) {
        let newSet = _.clone(this);
        newSet[propName] = value;
        return newSet;
    }

    cloneAndAddFeature(feature) {
        if (!feature.getName()) {
            throw new RangeError("Feature must have a name");
        }
        const featureNames = new Set(this.features.map(feature => feature.getName()));
        if (featureNames.has(feature.getName())) {
            throw new RangeError("No duplicate feature names allowed");
        }

        const genomeIntersection = this.genome.intersectInterval(feature.getCoordinates());
        if (!genomeIntersection || genomeIntersection.getLength() < RegionSet.MIN_REGION_LENGTH) {
            throw new RangeError("Feature not in genome or is too short");
        }

        let newFeatures = this.features.slice();
        newFeatures.push(feature);
        return this.cloneAndSet("features", newFeatures);
    }

    cloneAndDeleteFeature(index) {
        let newFeatures = this.features.slice();
        newFeatures.splice(index, 1);
        return this.cloneAndSet("features", newFeatures);
    }

    makeFlankedFeatures() {
        return this.features.map(feature => this.flankingStrategy.makeFlankedFeature(feature, this.genome));
    }

    makeNavContext() {
        const flankedFeatures = this.makeFlankedFeatures();
        return new NavigationContext(this.name, flankedFeatures);
    }
}

export default RegionSet;
