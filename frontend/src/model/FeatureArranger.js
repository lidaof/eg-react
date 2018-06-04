import LinearDrawingModel from './LinearDrawingModel';
import OpenInterval from './interval/OpenInterval';

class FeatureArranger {
    /**
     * 
     * @param {Feature[]} features 
     * @param {DisplayedRegionModel} viewRegion
     * @param {number} width
     * @param {IntervalArranger} intervalArranger 
     * @return {Object}
     */
    arrange(features, viewRegion, width, intervalArranger) {
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const navContext = viewRegion.getNavigationContext();
        const visibleFeatures = features.filter(feature => drawModel.basesToXWidth(feature.getLength()) >= 0.5);

        // Calculate draw locations
        let featureArrangement = [];
        let drawLocations = [];
        for (let feature of visibleFeatures) {
            for (let location of feature.computeNavContextCoordinates(navContext)) {
                const startX = Math.max(0, drawModel.baseToX(location.start));
                const endX = Math.min(drawModel.baseToX(location.end), drawModel.getDrawWidth());

                if (startX < endX) {
                    let drawLocation = new OpenInterval(startX, endX);
                    drawLocation.feature = feature;
                    drawLocations.push(drawLocation);
                    featureArrangement.push({
                        feature: feature,
                        absLocation: new OpenInterval(...location),
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
            featureArrangement: featureArrangement,
            numRowsAssigned: intervalArranger.getNumRowsAssigned(),
            numHidden: features.length - featureArrangement.length,
        };
    }
}

export default FeatureArranger;
