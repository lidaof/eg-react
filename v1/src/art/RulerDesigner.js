import React from 'react';
import Designer from './Designer';
import LinearDrawingModel from '../model/LinearDrawingModel';

const MAX_MAJOR_TICKS = 15;
const MINOR_TICKS = 5;
const MAJOR_TICK_HEIGHT = 10;
const MINOR_TICK_HEIGHT = 5;
const COLOR = "#bbb";

class RulerDesigner extends Designer {
    constructor(viewRegion, width) {
        super();
        this._viewRegion = viewRegion;
        this._drawModel = new LinearDrawingModel(viewRegion, width);
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
     * Clears this group and redraws the ruler.
     * 
     * @override
     */
    design() {
        // If one wanted MAX_MAJOR_TICKS to represent the min number of ticks, use Math.floor() instead.
        const log10BasesPerMajorTick = Math.ceil(Math.log10(this._viewRegion.getWidth() / MAX_MAJOR_TICKS));
        const basesPerMajorTick = Math.pow(10, log10BasesPerMajorTick); // Ensures each major tick is a power of 10.
        const pixelsPerMajorTick = this._drawModel.basesToXWidth(basesPerMajorTick);
        const pixelsPerMinorTick = pixelsPerMajorTick / MINOR_TICKS;
        const unit = this._getMajorUnit(log10BasesPerMajorTick);

        let children = [];
        children.push(<line // The horizontal line spanning the width of the ruler
            key="baseLine"
            x1={0}
            y1={0}
            x2={this._drawModel.getDrawWidth()}
            y2={0}
            stroke={COLOR}
            strokeWidth={1}
        />);

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
                // The major tick line
                children.push(<line
                    key={majorX}
                    x1={majorX}
                    y1={-MAJOR_TICK_HEIGHT}
                    x2={majorX}
                    y2={0}
                    stroke={COLOR}
                    strokeWidth={2}
                />);

                // Label for the major tick
                if (relativeBase > 0) {
                    children.push(<text key={"text" + majorX} x={majorX} y={20} style={{textAnchor: "middle"}}>
                        {relativeBase / unit.size + unit.name}
                    </text>);
                }

                // Minor ticks
                let minorX = majorX + pixelsPerMinorTick;
                let minorTickEndX = Math.min(majorX + pixelsPerMajorTick, majorTickEndX);
                while (minorX < minorTickEndX) {
                    children.push(<line
                        key={minorX}
                        x1={minorX}
                        y1={-MINOR_TICK_HEIGHT}
                        x2={minorX}
                        y2={0}
                        stroke={COLOR}
                        strokeWidth={2}
                    />);
                    minorX += pixelsPerMinorTick
                }

                // Update major tick loop vars
                relativeBase += basesPerMajorTick;
                majorX += pixelsPerMajorTick;
            } // End while (majorX < majorTickEndX) { ... }
        } // End for (let region of regionList) { ... }

        return children;
    }
}

export default RulerDesigner;
