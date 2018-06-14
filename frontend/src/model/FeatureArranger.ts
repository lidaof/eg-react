import DisplayedRegionModel from './DisplayedRegionModel';
import { Feature } from './Feature';
import { FeaturePlacer, PlacedFeature } from './FeaturePlacer';
import LinearDrawingModel from './LinearDrawingModel';

/**
 * Draw information for a Feature, plus row
 */
export interface PlacedFeatureWithRow extends PlacedFeature {
    row: number; // The row assignment, indexed from 0
}
type PaddingFunc = (feature: Feature) => number;

/**
 * Return value from FeatureArranger::arrange()
 */
interface FeatureArrangementResult {
    placements: PlacedFeatureWithRow[]; // The draw locations of features that are visible
    numRowsAssigned: number; // Number of rows required to view all features
    numHidden: number; // Number of features omitted from featureArrangement
}

export class FeatureArranger {
    /**
     * Assigns rows to each placed feature, mutating the objects.  Returns the number of rows assigned.
     * 
     * @param {PlacedFeature[]} placements - placed features to modify
     * @param {number | PaddingFunc} padding - getter of padding.  See the arrange() method for more info.
     * @return {number} the number of rows assigned
     */
    _assignRows(placements: PlacedFeature[], padding: number | PaddingFunc): number {
        const maxXsForRows: number[] = [];
        const isConstPadding = typeof padding === "number";
        for (const placedFeature of placements) {
            const horizontalPadding = isConstPadding ?
                (padding as number) : (padding as PaddingFunc)(placedFeature.feature);
            const startX = placedFeature.xLocation.start - horizontalPadding;
            const endX = placedFeature.xLocation.end + horizontalPadding;
            // Find the first row where the interval won't overlap with others in the row
            let row = maxXsForRows.findIndex(maxX => maxX < startX);
            if (row === -1) { // Couldn't find a row -- make a new one
                maxXsForRows.push(endX);
                row = maxXsForRows.length - 1;
            } else {
                maxXsForRows[row] = endX;
            }
            (placedFeature as PlacedFeatureWithRow).row = row;
        }

        return maxXsForRows.length;
    }

    /**
     * Calculates draw locations for an array of features, as well rows indices to minimize overlaps.  This method skips
     * features too small to draw; the number skipped shall be in the return result.
     * 
     * The optional `padding` parameter configures horizontal padding for intervals:
     * * If `padding` is a number, all intervals will have that constant padding.
     * * If `padding` is a function, it should take a feature and return the desired horizontal padding.
     * 
     * @param {Feature[]} features - features to draw
     * @param {DisplayedRegionModel} viewRegion - used to compute drawing coordinates 
     * @param {number} width - width of the visualization
     * @param {number | PaddingFunc} [padding] - horizontal padding for intervals.  Default 0.
     * @return {FeatureArrangementResult} suggested draw location info
     */
    arrange(features: Feature[], viewRegion: DisplayedRegionModel, width: number,
            padding: number | PaddingFunc = 0): FeatureArrangementResult
        {
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const visibleFeatures = features.filter(feature => drawModel.basesToXWidth(feature.getLength()) >= 0.5);

        const placer = new FeaturePlacer();
        const placements = placer.placeFeatures(visibleFeatures, viewRegion, width);
        const numRowsAssigned = this._assignRows(placements, padding);
        return {
            placements: placements as PlacedFeatureWithRow[],
            numRowsAssigned,
            numHidden: features.length - visibleFeatures.length,
        };
    }
}

export default FeatureArranger;
