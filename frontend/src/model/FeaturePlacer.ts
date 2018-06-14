import DisplayedRegionModel from './DisplayedRegionModel';
import { Feature } from './Feature';
import OpenInterval from './interval/OpenInterval';
import LinearDrawingModel from './LinearDrawingModel';
import NavigationContext from './NavigationContext';

/**
 * Draw information for a Feature
 */
export interface PlacedFeature {
    feature: Feature; // The feature
    /**
     * The location of the feature in navigation context coordinates.  The programmer should not assume that this
     * interval's length is equal to the feature's length, because some parts of the feature might not exist in the
     * navigation context.   (suppose that the context only contains chr1:50-100 but the feature is chr1:0-200).
     */
    contextLocation: OpenInterval;
    offsetOfLocation: number; // The location of `contextLocation` in the feature.  
    xLocation: OpenInterval; // Horizontal location the feature should occupy
}

export class FeaturePlacer {
    /**
     * Computes context and draw locations for a list of features.  There may be a different number of placed features
     * than input features, as a feature might map to several different nav context coordinates, or a feature might
     * not map at all.
     * 
     * @param {Feature[]} features - features for which to compute draw locations
     * @param {DisplayedRegionModel} viewRegion - region in which to draw
     * @param {number} width - width of visualization
     * @return {PlacedFeature[]} draw info for the features
     */
    placeFeatures(features: Feature[], viewRegion: DisplayedRegionModel, width: number): PlacedFeature[] {
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const navContext = viewRegion.getNavigationContext();

        const placements = [];
        for (const feature of features) {
            for (const location of feature.computeNavContextCoordinates(navContext)) {
                const startX = Math.max(0, drawModel.baseToX(location.start));
                const endX = Math.min(drawModel.baseToX(location.end), width - 1);
                if (startX < endX) {
                    placements.push({
                        feature,
                        contextLocation: location,
                        offsetOfLocation: this._locateContextInterval(feature, navContext, location),
                        xLocation: new OpenInterval(startX, endX)
                    });
                }
            }
        }

        return placements;
    }

    /**
     * 
     * @param {Feature} feature 
     * @param {NavigationContext} navContext 
     * @param {OpenInterval} mappedLocation 
     * @return {number}
     */
    _locateContextInterval(feature: Feature, navContext: NavigationContext, mappedLocation: OpenInterval): number {
        /**
         * Convert mapped context location to genomic coordinates, so we can directly compare it to the feature's locus.
         * This expression assumes the mapped location only spans one chromosome, which it should, because the feature
         * should only span one chromosome as well.
         */
        const mappedLocus = navContext
            .convertBaseToFeatureCoordinate(mappedLocation.start) 
            .getGenomeCoordinates();
        const offset = mappedLocus.start - feature.getLocus().start;
        return offset;
    }


}
