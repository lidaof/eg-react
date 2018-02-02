import React from 'react';
import Designer from './Designer';
import LinearDrawingModel from '../model/LinearDrawingModel';

const MAX_MAJOR_TICKS = 15;
const MINOR_TICKS = 5;
const MAJOR_TICK_HEIGHT = 10; // Minor tick height is half this
const COLOR = '#bbb';

/**
 * Designs a ruler that displays feature coordinates.  Note that feature coordinates are not necessarily genomic
 * coordinates.
 * 
 * @author Silas Hsu
 */
export class RulerDesigner extends Designer {
    /**
     * 
     * @param {DisplayedRegionModel} viewRegion - region to visualize
     * @param {number} width - width of the ruler
     * @param {RulerComponentFactory} [rulerComponentFactory]
     */
    constructor(viewRegion, width, rulerComponentFactory=new RulerComponentFactory()) {
        super();
        this._viewRegion = viewRegion;
        this._drawModel = new LinearDrawingModel(viewRegion, width);
        this._componentFactory = rulerComponentFactory;
    }

    /**
     * @typedef {Object} Ruler~Unit
     * @property {number} size - the number of base pairs in this unit
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
        if (log10BasesPerTick >= 5) { // 10K
            return {
                size: 1000000,
                name: "M",
            };
        } else if (log10BasesPerTick > 2) { // 100
            return {
                size: 1000,
                name: "K",
            };
        }

        return {
            size: 1,
            name: "",
        };
    }

    /**
     * Designs the ruler.
     * 
     * @override
     */
    design() {
        // If one wanted MAX_MAJOR_TICKS to represent the min number of ticks, use Math.floor() instead.
        const log10BasesPerMajorTick = Math.ceil(Math.log10(this._viewRegion.getWidth() / MAX_MAJOR_TICKS));
        const basesPerMajorTick = Math.pow(10, log10BasesPerMajorTick); // Ensures each major tick is a power of 10.
        const basesPerMinorTick = basesPerMajorTick / MINOR_TICKS;
        const pixelsPerMajorTick = this._drawModel.basesToXWidth(basesPerMajorTick);
        const pixelsPerMinorTick = pixelsPerMajorTick / MINOR_TICKS;
        const unit = this._getMajorUnit(log10BasesPerMajorTick);

        let children = [];
        // The horizontal line spanning the width of the ruler
        children.push(this._componentFactory.mainLine(this._drawModel.getDrawWidth()));

        const intervals = this._viewRegion.getFeatureIntervals();
        for (let interval of intervals) {
            const featureAbsStart = this._viewRegion.getNavigationContext().getFeatureStart(interval.getName());
            const majorTickEndX = this._drawModel.baseToX(featureAbsStart + interval.relativeEnd);
            // relativeBase = round down to the nearest major tick base for this region, to find where to start drawing
            let relativeBase = Math.floor(interval.relativeStart / basesPerMajorTick) * basesPerMajorTick;
            let majorX = this._drawModel.baseToX(featureAbsStart + relativeBase);

            // This loop updates relativeBase and majorX every iteration
            // Draw major and minor ticks for this region (chromosome)
            while (majorX < majorTickEndX) {
                // Major ticks
                children.push(this._componentFactory.majorTick(majorX));
                if (relativeBase > 0) {
                    children.push(this._componentFactory.majorTickText(majorX, relativeBase / unit.size + unit.name));
                }

                // Minor ticks
                let minorX = majorX + pixelsPerMinorTick;
                let minorTickEndX = Math.min(majorX + pixelsPerMajorTick, majorTickEndX);
                let minorBase = relativeBase + basesPerMinorTick;
                while (minorX < minorTickEndX) {
                    children.push(this._componentFactory.minorTick(minorX));
                    children.push(this._componentFactory.minorTickText(minorX, minorBase / unit.size));
                    minorBase += basesPerMinorTick;
                    minorX += pixelsPerMinorTick;
                }

                // Update major tick loop vars
                relativeBase += basesPerMajorTick;
                majorX += pixelsPerMajorTick;
            } // End while (majorX < majorTickEndX) { ... }
        } // End for (let region of regionList) { ... }

        return children;
    }
}

export class RulerComponentFactory {
    constructor(color=COLOR, majorTickHeight=MAJOR_TICK_HEIGHT) {
        this.color = color;
        this.majorTickHeight = majorTickHeight;
    }

    mainLine(width) {
        return <line key="mainLine" x1={0} y1={0} x2={width} y2={0} stroke={this.color} strokeWidth={1} />;
    }

    majorTick(x) {
        return <line key={x} x1={x} y1={-this.majorTickHeight} x2={x} y2={0} stroke={this.color} strokeWidth={2} />;
    }

    majorTickText(x, text) {
        return <text key={"text" + x}  x={x} y={20} style={{textAnchor: "middle"}} >{text}</text>;
    }

    minorTick(x) {
        return <line key={x} x1={x} y1={-this.majorTickHeight / 2} x2={x} y2={0} stroke={this.color} strokeWidth={1} />;
    }

    minorTickText(x, text) {
        return null;
    }
}

export default RulerDesigner;
