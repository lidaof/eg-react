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
     * Expands a region according to the parameters set in the constructor.  Does not modify the input.
     * 
     * @param {DisplayedRegionModel} region - region to expand
     * @return {DisplayedRegionModel} expanded region
     */
    makeExpandedRegion(region: DisplayedRegionModel): DisplayedRegionModel {
        const expandedModel = region.clone();
        expandedModel.zoom(this.zoomRatio);
        return expandedModel;
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
        const expandedRegion = this.makeExpandedRegion(region);
        const expandedWidth = expandedRegion.getWidth() * pixelsPerBase;

        const originalAbsRegion = region.getAbsoluteRegion();
        const expandedAbsRegion = expandedRegion.getAbsoluteRegion();
        const leftBaseDiff = originalAbsRegion.start - expandedAbsRegion.start;
        const rightBaseDiff = expandedAbsRegion.end - originalAbsRegion.end;

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
