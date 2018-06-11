import LinearDrawingModel from './LinearDrawingModel';
import OpenInterval from './interval/OpenInterval';
import IntervalArranger from './interval/IntervalArranger';
import DisplayedRegionModel from './DisplayedRegionModel';
import { Feature } from './Feature';

/**
 * Draw information for a Feature
 */
interface FeatureArrangement {
    feature: Feature; // The feature
    absLocation: OpenInterval; // The location of the feature in navigation context coordinates
    xLocation: OpenInterval; // Horizontal location the feature should occupy
    row: number; // The row assignment, indexed from 0
}

/**
 * Return value from FeatureArranger::arange()
 */
interface FeatureArrangementResult {
    featureArrangement: FeatureArrangement[]; // The draw locations of features that are visible
    numRowsAssigned: number; // Number of rows required to view all features
    numHidden: number; // Number of features omitted from featureArrangement
}

class FeatureArranger {
    /**
     * Calculates draw locations for an array of features, as well rows for them so they do not overlap.
     * 
     * @param {Feature[]} features - features to draw
     * @param {DisplayedRegionModel} viewRegion - used to compute drawing coordinates 
     * @param {number} width - width of the visualization
     * @param {IntervalArranger} intervalArranger - arranger of draw locations
     * @return {FeatureArrangementResult} draw location results
     */
    arrange(features: Feature[], viewRegion: DisplayedRegionModel, width: number,
            intervalArranger: IntervalArranger): FeatureArrangementResult
        {
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const navContext = viewRegion.getNavigationContext();
        const visibleFeatures = features.filter(feature => drawModel.basesToXWidth(feature.getLength()) >= 0.5);

        // Calculate draw locations
        const featureArrangement = [];
        const drawLocations = [];
        for (const feature of visibleFeatures) {
            for (const location of feature.computeNavContextCoordinates(navContext)) {
                const startX = Math.max(0, drawModel.baseToX(location.start));
                const endX = Math.min(drawModel.baseToX(location.end), drawModel.getDrawWidth());

                if (startX < endX) {
                    const drawLocation = new OpenInterval(startX, endX);
                    (drawLocation as any).feature = feature;
                    drawLocations.push(drawLocation);
                    featureArrangement.push({
                        feature,
                        absLocation: new OpenInterval(location.start, location.end),
                        xLocation: new OpenInterval(startX, endX),
                        row: 0 // We'll assign rows in a moment
                    });
                }
            }
        }

        // Assign rows
        const rowAssignments = intervalArranger.arrange(drawLocations);
        featureArrangement.forEach((featureData, i) => featureData.row = rowAssignments[i]);

        return {
            featureArrangement,
            numRowsAssigned: intervalArranger.getNumRowsAssigned(),
            numHidden: features.length - featureArrangement.length,
        };
    }
}

export default FeatureArranger;
