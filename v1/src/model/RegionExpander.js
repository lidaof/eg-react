import _ from 'lodash';
import LinearDrawingModel from './LinearDrawingModel';

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
     * Calculates an expansion in region width according to the parameters set in the constructor.
     * 
     * @param {number} width - width of a region
     * @return {number} width of a region after expansion
     */
    expandWidth(width) {
        return width * this.zoomRatio;
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
     * Makes a draw model suitable for a expanded view region.  Magnitude of expansion is set in the constructor.  Does
     * not modify any of the inputs.
     * 
     * @param {DisplayedRegionModel} region - unexpanded region
     * @param {number} width - unexpanded width
     * @param {HTMLElement} node - DOM element to pass to LinearDrawingModel constructor
     * @return {LinearDrawingModel} - draw model suitable for a expanded view region
     */
    makeDrawModel(region, width, node) {
        return new LinearDrawingModel(this.makeExpandedRegion(region), this.expandWidth(width), node);
    }
}

export default RegionExpander;
