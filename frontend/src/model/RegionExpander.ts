import memoizeOne from 'memoize-one';
import OpenInterval from './interval/OpenInterval';
import DisplayedRegionModel from './DisplayedRegionModel';

/**
 * Data describing an expanded view region.
 */
export interface ViewExpansion {
    /**
     * Total width, in pixels, of the expanded view
     */
    visWidth: number;

    /**
     * Expanded region
     */
    visRegion: DisplayedRegionModel;

    /**
     * The X range of pixels that would display the unexpanded region
     */
    viewWindow: OpenInterval;
}

/**
 * Utility class that does calculations related to expanding view regions for the purposes of scrolling.
 * 
 * @author Silas Hsu
 */
export class RegionExpander {
    static DEFAULT_EXPANSION = 1;

    /**
     * @return a RegionExpander which does not do any expansion at all.
     */
    static makeIdentityExpander(): RegionExpander {
        return new RegionExpander(0);
    }

    public zoomRatio: number;

    /**
     * @param {number} multipleOnEachSide - magnitude of expansion on each side, as a multiple of region width.
     */
    constructor(public multipleOnEachSide: number=RegionExpander.DEFAULT_EXPANSION) {
        this.multipleOnEachSide = multipleOnEachSide;
        this.zoomRatio = 2 * multipleOnEachSide + 1;
        this.calculateExpansion = memoizeOne(this.calculateExpansion);
    }

    /**
     * Calculates an expansion of a view region from the input pixel width and region model.  Returns both the expanded
     * region and how many pixels on each side of the orignal view to allocate to display additional data.  Handles
     * cases such expanding near the edge of the genome, so that views will always remain inside the genome.
     * 
     * @param {DisplayedRegionModel} region - the region that the unexpanded view will show
     * @param {number} visWidth - the width, in pixels, of the view to expand
     * @return {ViewExpansion} - data representing aspects of an expanded region
     */
    calculateExpansion(region: DisplayedRegionModel, visWidth: number): ViewExpansion {
        const pixelsPerBase = visWidth / region.getWidth();
        const expandedRegion = region.clone().zoom(this.zoomRatio);
        const expandedWidth = expandedRegion.getWidth() * pixelsPerBase;

        const originalContextInterval = region.getContextCoordinates();
        const expandedContextInterval = expandedRegion.getContextCoordinates();
        const leftBaseDiff = originalContextInterval.start - expandedContextInterval.start;
        const rightBaseDiff = expandedContextInterval.end - originalContextInterval.end;

        const leftExtraPixels = leftBaseDiff * pixelsPerBase;
        const rightExtraPixels = rightBaseDiff * pixelsPerBase;

        return {
            visWidth: expandedWidth,
            visRegion: expandedRegion,
            viewWindow: new OpenInterval(leftExtraPixels, expandedWidth - rightExtraPixels),
        };
    }
}
