import LinearDrawingModel from './LinearDrawingModel';
import OpenInterval from './interval/OpenInterval';
import IntervalArranger from './interval/IntervalArranger';
import DisplayedRegionModel from './DisplayedRegionModel';
import { Feature } from './Feature';

interface FeatureArrangement {
    feature: Feature;
    absLocation: OpenInterval;
    xLocation: OpenInterval;
    row: number;
}

interface FeatureArrangementResult {
    featureArrangement: FeatureArrangement;
    numRowsAssigned: number;
    numHidden: number;
}

class FeatureArranger {
    /**
     * 
     * @param {Feature[]} features 
     * @param {DisplayedRegionModel} viewRegion
     * @param {number} width
     * @param {IntervalArranger} intervalArranger 
     * @return {Object}
     */
    arrange(features: Feature[], viewRegion: DisplayedRegionModel, width: number, intervalArranger: IntervalArranger) {
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
