import _ from 'lodash';

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
    static makeIdentityExpander() {
        return new RegionExpander(0);
    }

    /**
     * @param {number} multipleOnEachSide - magnitude of expansion on each side, as a multiple of region width.
     */
    constructor(multipleOnEachSide=RegionExpander.DEFAULT_EXPANSION) {
        this.multipleOnEachSide = multipleOnEachSide;
        this.zoomRatio = 2 * multipleOnEachSide + 1;
    }

    /**
     * Expands a region according to the parameters set in the constructor.  Does not modify the input.
     * 
     * @param {DisplayedRegionModel} region - region to expand
     * @return {DisplayedRegionModel} expanded region
     */
    makeExpandedRegion(region) {
        let expandedModel = _.clone(region);
        expandedModel.zoom(this.zoomRatio);
        return expandedModel;
    }

    /**
     * Return object of calculateExpansion.  Note that expandedWidth = (original width provided to the function) +
     * leftExtraPixels + rightExtraPixels.
     * 
     * @typedef {Object} RegionExpander~ExpansionData
     * @property {number} expandedWidth - total width, in pixels, of the expanded view
     * @property {DisplayedRegionModel} expandedRegion - model of expanded region
     * @property {number} - how many pixels on the left side to allocate to additional data
     * @property {number} - how many pixels on the right side to allocate to additional data
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
    calculateExpansion(width, region) {
        let pixelsPerBase = width / region.getWidth();
        let expandedRegion = this.makeExpandedRegion(region);
        let expandedWidth = expandedRegion.getWidth() * pixelsPerBase;

        let originalAbsRegion = region.getAbsoluteRegion();
        let expandedAbsRegion = expandedRegion.getAbsoluteRegion();
        let leftBaseDiff = originalAbsRegion.start - expandedAbsRegion.start;
        let rightBaseDiff = expandedAbsRegion.end - originalAbsRegion.end;

        let leftExtraPixels = leftBaseDiff * pixelsPerBase;
        let rightExtraPixels = rightBaseDiff * pixelsPerBase;

        return {
            expandedWidth: expandedWidth,
            expandedRegion: expandedRegion,
            leftExtraPixels: leftExtraPixels,
            rightExtraPixels: rightExtraPixels
        };
    }
}

export default RegionExpander;
