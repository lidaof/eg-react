/**
 * Utility class for converting between pixels and base numbers.
 * 
 * @author Silas Hsu
 */
class LinearDrawingModel {
    /**
     * Makes a new instance.
     * 
     * @param {DisplayedRegionModel} model - the displayed region
     * @param {number} drawWidth - the width of the canvas/svg/etc on which to draw
     */
    constructor(model, drawWidth) {
        this._model = model;
        this._drawWidth = drawWidth;
    }

    /**
     * @return {number} the drawing width with which this model was created
     */
    getDrawWidth() {
        return this._drawWidth;
    }

    /**
     * Gets the horizontal width in pixels required to represent a number of bases.
     * 
     * @param {number} bases - width in number of bases
     * @return {number} width in pixels
     */
    basesToXWidth(bases) {
        let pixelsPerBase = this._drawWidth / this._model.getWidth();
        return bases * pixelsPerBase;
    }

    /**
     * Gets how many bases represented by a horizontal span of the SVG.
     * 
     * @param {number} pixels - width of a horizontal span
     * @return {number} width in number of bases
     */
    xWidthToBases(pixels) {
        let basesPerPixel = this._model.getWidth() / this._drawWidth;
        return pixels * basesPerPixel;
    }

    /**
     * Given an absolute base number, gets the X coordinate that represents that base.
     * 
     * @param {number} base - absolute base coordinate
     * @return {number} X coordinate that represents the input base
     */
    baseToX(base) {
        let pixelsPerBase = this._drawWidth / this._model.getWidth();
        return (base - this._model.getAbsoluteRegion().start) * pixelsPerBase;
    }

    /**
     * Given an X coordinate representing a base, gets the absolute base number.
     * 
     * @param {number} pixel - X coordinate that represents a base
     * @return {number} absolute base coordinate
     */
    xToBase(pixel) {
        let basesPerPixel = this._model.getWidth() / this._drawWidth;
        return pixel * basesPerPixel + this._model.getAbsoluteRegion().start;
    }
}

export default LinearDrawingModel;
