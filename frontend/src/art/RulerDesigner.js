import React from 'react';
import LinearDrawingModel from '../model/LinearDrawingModel';

const MINOR_TICKS = 10;
// For default display colors, sizes, etc. scroll down to RulerElementFactory.

/**
 * Designs a ruler that displays feature coordinates.  Note that feature coordinates are not necessarily genomic
 * coordinates.
 * 
 * @author Silas Hsu
 */
export class RulerDesigner {
    /**
     * Configures a new instance.  What elements the design() method returns depends on the passed
     * RulerElementFactory.  There is a default RulerElementFactory implementation; see those docs to find out what
     * it returns.
     * 
     * @param {number} [tickSeparationHint] - requested X separation of major ticks
     * @param {RulerElementFactory} [rulerElementFactory] - element generator
     */
    constructor(tickSeparationHint=50, rulerElementFactory=new RulerElementFactory()) {
        this._tickSeparationHint = tickSeparationHint;
        this._elementFactory = rulerElementFactory;
    }

    /**
     * @typedef {Object} Ruler~Unit
     * @property {number} size - the number of base pairs in this unit
     * @property {number} digits - the number of digits after the decimal point to display
     * @property {string} name - a string that represents this unit
     */

    /**
     * Gets the unit for the major tick labels, depending on the number of bases between ticks.  Chooses between unit
     * base, kilobase, and megabase.
     * 
     * @param {number} log10BasesPerTick - log10() of the number of bases between ticks
     * @return {Ruler~Unit} the unit for tick labels
     */
    _getMajorUnit(log10BasesPerTick) {
        if (log10BasesPerTick >= 6) { // 10K (Daofeng updated to 6 from 5)
            return {
                size: 1000000,
                digits: 1,
                name: "M",
            };
        } else if (log10BasesPerTick > 3) { // 100 (Daofeng updated to 3 from 2)
            return {
                size: 1000,
                digits: 0,
                name: "K",
            };
        } else {
            return {
                size: 1,
                digits: 0,
                name: "",
            };
        }
    }

    /**
     * Designs the ruler.  Returns an array of anything, depending on the RulerElementFactory configured when this
     * object was created.
     * 
     * @param {DisplayedRegionModel} viewRegion - the region to visualize
     * @param {number} width - X width of the ruler
     * @return {any[]} ruler design
     */
    design(viewRegion, width) {
        const navContext = viewRegion.getNavigationContext();
        const drawModel = new LinearDrawingModel(viewRegion, width);
        const numMajorTicks = drawModel.getDrawWidth() / this._tickSeparationHint;
        // If one wanted numMajorTicks to represent the min number of ticks, use Math.floor() instead.
        const log10BasesPerMajorTick = Math.ceil(Math.log10(viewRegion.getWidth() / numMajorTicks));
        const basesPerMajorTick = Math.pow(10, log10BasesPerMajorTick); // Ensures each major tick is a power of 10.
        const basesPerMinorTick = basesPerMajorTick / MINOR_TICKS;
        const pixelsPerMajorTick = drawModel.basesToXWidth(basesPerMajorTick);
        const pixelsPerMinorTick = pixelsPerMajorTick / MINOR_TICKS;
        const unit = this._getMajorUnit(log10BasesPerMajorTick);

        const elementFactory = this._elementFactory;
        const elements = [];
        // The horizontal line spanning the width of the ruler
        elements.push(elementFactory.mainLine(drawModel.getDrawWidth()));

        const segments = viewRegion.getFeatureSegments(false);
        for (const segment of segments) {
            const segmentLocus = segment.getLocus();
            const segmentContextSpan = navContext.convertFeatureSegmentToContextCoordinates(segment);
            addTicks(segmentLocus, segmentContextSpan, true, segment.feature.getIsReverseStrand()); // Major
            if (basesPerMinorTick >= 1) {
                addTicks(segmentLocus, segmentContextSpan, false, segment.feature.getIsReverseStrand()); // Minor
            }
        }

        return elements;

        function addTicks(locus, contextSpan, isMajor=true, isReverse=false) {
            let xPerTick, basesPerTick, getTickElement, getTextElement;
            if (isMajor) {
                xPerTick = pixelsPerMajorTick;
                basesPerTick = basesPerMajorTick;
                // For some reason, the bind()s are necessary.
                getTickElement = elementFactory.majorTick.bind(elementFactory);
                getTextElement = elementFactory.majorTickText.bind(elementFactory);
            } else {
                xPerTick = pixelsPerMinorTick;
                basesPerTick = basesPerMinorTick;
                getTickElement = elementFactory.minorTick.bind(elementFactory);
                getTextElement = elementFactory.minorTickText.bind(elementFactory);
            }

            let startBase, basesRounded;
            if (isReverse) {
                startBase = roundDown(locus.end, basesPerTick);
                basesRounded = locus.end - startBase;
                basesPerTick *= -1;
            } else {
                startBase = roundUp(locus.start, basesPerTick);
                basesRounded = startBase - locus.start;
            }
            
            const xStart = drawModel.baseToX(contextSpan.start + basesRounded);
            const xEnd = drawModel.baseToX(contextSpan.end);
            let x = xStart;
            let base = startBase;
            while (x < xEnd) {
                elements.push(getTickElement(x));
                const numberToDisplay = (base / unit.size).toFixed(unit.digits);
                if (numberToDisplay > 0) {
                    elements.push(getTextElement(x, numberToDisplay + unit.name));
                }

                x += xPerTick;
                base += basesPerTick;
            }
        }

        function roundUp(n, precision) {
            return Math.ceil(n / precision) * precision;
        }

        function roundDown(n, precision) {
            return Math.floor(n / precision) * precision;
        }
    }
}

const COLOR = '#bbb';
const MAJOR_TICK_HEIGHT = 10; // Minor tick height is half this
const FONT_SIZE = 12;

/**
 * A generator of elements for a Ruler design.  Allows customization of RulerDesigners.  The default implementation
 * returns React elements that are valid <svg> elements.
 * 
 * @author Silas Hsu
 */
export class RulerElementFactory {
    /**
     * Configures a new instance that returns React elements that are valid <svg> elements.
     * 
     * @param {string} color - color of the elements
     * @param {number} majorTickHeight - height of major ticks.  Minor ticks will be half this height.
     */
    constructor(color=COLOR, majorTickHeight=MAJOR_TICK_HEIGHT, fontSize=FONT_SIZE) {
        this.color = color;
        this.majorTickHeight = majorTickHeight;
        this.fontSize = fontSize;
    }

    /**
     * Creates a element that represents a line that spans the entire width of the ruler.
     * 
     * @param {number} width - width of the ruler
     * @return {JSX.Element} 
     */
    mainLine(width) {
        return <line key="mainLine" x1={0} y1={0} x2={width} y2={0} stroke={this.color} strokeWidth={1} />;
    }

    /**
     * Creates a element that represents a major tick of the ruler.
     * 
     * @param {number} x - x coordinate of the tick
     * @return {JSX.Element} 
     */
    majorTick(x) {
        const key = "major" + x;
        return <line key={key} x1={x} y1={-this.majorTickHeight} x2={x} y2={0} stroke={this.color} strokeWidth={2} />;
    }

    /**
     * Creates a element that labels a major tick of the ruler.
     * 
     * @param {number} x - x coordinate of the tick
     * @param {string} text - label for the tick
     * @return {JSX.Element} 
     */
    majorTickText(x, text) {
        const style = {
            textAnchor: "middle",
            fontSize: this.fontSize
        };
        return <text key={"text" + x} x={x} y={this.fontSize + 2} style={style} >{text}</text>;
    }

    /**
     * Creates a element that represents minor tick of the ruler.
     * 
     * @param {number} x - x coordinate of the tick
     * @return {JSX.Element} 
     */
    minorTick(x) {
        const key = "minor" + x;
        const y1 = -this.majorTickHeight / 2;
        return <line key={key} x1={x} y1={y1} x2={x} y2={0} stroke={this.color} strokeWidth={1} />;
    }

    /**
     * Creates a element that labels a minor tick of the ruler.
     * 
     * @param {number} x - x coordinate of the tick
     * @param {string} text - label for the tick
     * @return {JSX.Element}
     */
    minorTickText(x, text) {
        return null;
    }
}

export default RulerDesigner;
