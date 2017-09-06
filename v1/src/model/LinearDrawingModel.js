class LinearDrawingModel {
    constructor(model, svgNode) {
        this.model = model;
        this.svgNode = svgNode;
    }

    getSvgWidth() {
        return this.svgNode.clientWidth;
    }

    /**
     * Gets the horizontal width in pixels required to represent a number of bases.
     * 
     * @param {number} bases - width in number of bases
     * @return {number} width in pixels
     */
    basesToXWidth(bases) {
        let pixelsPerBase = this.getSvgWidth() / this.model.getWidth();
        return bases * pixelsPerBase;
    }

    /**
     * Gets how many bases represented by a horizontal span of the SVG.
     * 
     * @param {number} pixels - width of a horizontal span
     * @return {number} width in number of bases
     */
    xWidthToBases(pixels) {
        let basesPerPixel = this.model.getWidth() / this.getSvgWidth();
        return pixels * basesPerPixel;
    }

    /**
     * Given an absolute base number, gets the X coordinate that represents that base.
     * 
     * @param {number} base - absolute base coordinate
     * @return {number} X coordinate that represents the input base
     */
    baseToX(base) {
        let pixelsPerBase = this.getSvgWidth() / this.model.getWidth();
        return (base - this.model.getAbsoluteRegion().start) * pixelsPerBase;
    }

    /**
     * Given an X coordinate representing a base, gets the absolute base number.
     * 
     * @param {number} pixel - X coordinate that represents a base
     * @return {number} absolute base coordinate
     */
    xToBase(pixel) {
        let basesPerPixel = this.model.getWidth() / this.getSvgWidth();
        return pixel * basesPerPixel + this.model.getAbsoluteRegion().start;
    }

    /**
     * Given a X coordinate on the webpage (such as those contained in MouseEvents), gets the X coordinate in the SVG.
     * 
     * @param {number} domX - the X coordinate on the webpage
     * @return {number} the X coordinate in the SVG
     */
    domXToSvgX(domX) {
        return domX - this.svgNode.getBoundingClientRect().left;
    }
}

export default LinearDrawingModel;
