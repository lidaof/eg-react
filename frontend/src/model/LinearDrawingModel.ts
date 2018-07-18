import DisplayedRegionModel from './DisplayedRegionModel';
import OpenInterval from './interval/OpenInterval';
import { FeatureSegment } from './interval/FeatureSegment';

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
     * Given an nav context coordinate, gets the X coordinate that represents that base.
     * 
     * @param {number} base - nav context coordinate
     * @return {number} X coordinate that represents the input base
     */
    baseToX(base: number): number {
        return (base - this._viewRegion.getContextCoordinates().start) * this._pixelsPerBase;
    }

    /**
     * Given an X coordinate representing a base, gets the nav context coordinate.
     * 
     * @param {number} pixel - X coordinate that represents a base
     * @return {number} nav context coordinate
     */
    xToBase(pixel: number): number {
        return pixel * this._basesPerPixel + this._viewRegion.getContextCoordinates().start;
    }

    /**
     * Converts an interval of bases to an interval of X coordinates.  The `clamp` parameter ensures that the return
     * values lie between 0 and the draw width, but it might also cause `null` return values if both ends of the
     * interval fall out of range.
     * 
     * @param {OpenInterval} baseInterval - interval of bases to convert
     * @param {boolean} [clamp] - whether to ensure return values lie between 0 and the draw width
     * @return {OpenInterval} x draw interval
     */
    baseSpanToXSpan(baseInterval: OpenInterval, clamp=false): OpenInterval {
        let startX = this.baseToX(baseInterval.start);
        let endX = this.baseToX(baseInterval.end);
        if (clamp) {
            startX = Math.max(0, startX);
            endX = Math.min(endX, this._drawWidth - 1);
        }
        if (startX < endX) {
            return new OpenInterval(startX, endX);
        } else {
            return null;
        }
    }

    /**
     * Gets the genomic coordinates that a pixel coordinate represents.
     * 
     * @param {number} pixel - pixel coordinate that represents a base
     * @return {ChromosomeInterval} genomic coordinate that the pixel represents
     */
    xToSegmentCoordinate(pixel: number): FeatureSegment {
        const contextBase = this.xToBase(pixel);
        return this._viewRegion.getNavigationContext().convertBaseToFeatureCoordinate(contextBase);
    }
}

export default LinearDrawingModel;
