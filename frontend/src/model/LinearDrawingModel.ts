import DisplayedRegionModel from "./DisplayedRegionModel";
import ChromosomeInterval from "./interval/ChromosomeInterval";

/**
 * Utility class for converting between pixels and base numbers.
 * 
 * @author Silas Hsu
 */
class LinearDrawingModel {
    _viewRegion: DisplayedRegionModel;
    _drawWidth: number;
    _pixelsPerBase: number;
    _basesPerPixel: number;
    
    /**
     * Makes a new instance.
     * 
     * @param {DisplayedRegionModel} viewRegion - the displayed region
     * @param {number} drawWidth - the width of the canvas/svg/etc on which to draw
     */
    constructor(viewRegion: DisplayedRegionModel, drawWidth: number) {
        this._viewRegion = viewRegion;
        this._drawWidth = drawWidth;

        this._pixelsPerBase = this._drawWidth / this._viewRegion.getWidth();
        this._basesPerPixel = this._viewRegion.getWidth() / this._drawWidth;
    }

    /**
     * @return {number} the drawing width with which this model was created
     */
    getDrawWidth(): number {
        return this._drawWidth;
    }

    /**
     * Gets the horizontal width in pixels required to represent a number of bases.
     * 
     * @param {number} bases - width in number of bases
     * @return {number} width in pixels
     */
    basesToXWidth(bases: number): number {
        return bases * this._pixelsPerBase;
    }

    /**
     * Gets how many bases represented by a horizontal span of the SVG.
     * 
     * @param {number} pixels - width of a horizontal span
     * @return {number} width in number of bases
     */
    xWidthToBases(pixels: number): number {
        return pixels * this._basesPerPixel;
    }

    /**
     * Given an absolute base number, gets the X coordinate that represents that base.
     * 
     * @param {number} base - absolute base coordinate
     * @return {number} X coordinate that represents the input base
     */
    baseToX(base: number): number {
        return (base - this._viewRegion.getAbsoluteRegion().start) * this._pixelsPerBase;
    }

    /**
     * Given an X coordinate representing a base, gets the absolute base number.
     * 
     * @param {number} pixel - X coordinate that represents a base
     * @return {number} absolute base coordinate
     */
    xToBase(pixel: number): number {
        return pixel * this._basesPerPixel + this._viewRegion.getAbsoluteRegion().start;
    }

    /**
     * Gets the genomic coordinates that a pixel coordinate represents.
     * 
     * @param {number} pixel - pixel coordinate that represents a base
     * @return {ChromosomeInterval} genomic coordinate that the pixel represents
     */
    xToGenomeCoordinate(pixel: number): ChromosomeInterval {
        const absBase = this.xToBase(pixel);
        const featureCoord = this._viewRegion.getNavigationContext().convertBaseToFeatureCoordinate(absBase);
        return featureCoord.getGenomeCoordinates();
    }
}

export default LinearDrawingModel;
