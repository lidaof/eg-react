import OpenInterval from "./interval/OpenInterval";
import DisplayedRegionModel from "./DisplayedRegionModel";

/**
 * Utility class that does calculations related to expanding view regions for the purposes of scrolling.
 * 
 * @author Silas Hsu
 */
class RegionExpander {
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
    }

    /**
     * Return object of calculateExpansion.  Note that the length of `viewWindow` equals the original width provided to
     * the method.
     * 
     * @typedef {Object} RegionExpander~ExpansionData
     * @property {number} expandedWidth - total width, in pixels, of the expanded view
     * @property {DisplayedRegionModel} expandedRegion - model of expanded region
     * @property {OpenInterval} viewWindow - the X range of pixels that would display the unexpanded region
     */

    /**
     * Calculates an expansion of a view region from the input pixel width and region model.  Returns both the expanded
     * region and how many pixels on each side of the orignal view to allocate to display additional data.  Handles
     * cases such expanding near the edge of the genome, so that views will always remain inside the genome.
     * 
     * @param {number} width - the width, in pixels, of the view to expand
     * @param {DisplayedRegionModel} region - the region that the unexpanded view will show
     * @return {RegionExpander~ExpansionData} - data representing aspects of an expanded region
     */
    calculateExpansion(width: number, region: DisplayedRegionModel) {
        const pixelsPerBase = width / region.getWidth();
        const expandedRegion = region.clone().zoom(this.zoomRatio);
        const expandedWidth = expandedRegion.getWidth() * pixelsPerBase;

        const originalContextInterval = region.getContextCoordinates();
        const expandedContextInterval = expandedRegion.getContextCoordinates();
        const leftBaseDiff = originalContextInterval.start - expandedContextInterval.start;
        const rightBaseDiff = expandedContextInterval.end - originalContextInterval.end;

        const leftExtraPixels = leftBaseDiff * pixelsPerBase;
        const rightExtraPixels = rightBaseDiff * pixelsPerBase;

        return {
            width: expandedWidth,
            viewRegion: expandedRegion,
            viewWindow: new OpenInterval(leftExtraPixels, expandedWidth - rightExtraPixels),
        };
    }
}

export default RegionExpander;
