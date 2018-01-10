import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';
import withSvgJs from '../withSvgJs';

const MAX_MAJOR_TICKS = 15;
const MINOR_TICKS = 5;
const MAJOR_TICK_HEIGHT = 10;
const MINOR_TICK_HEIGHT = 5;

/**
 * Draws a ruler that displays feature coordinates.
 * 
 * @author Silas Hsu
 */
class Ruler extends React.Component {
    static propTypes = {
        group: PropTypes.instanceOf(SVG.Element).isRequired, // An object from SVG.js to draw in
        displayedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region to visualize
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // The drawing model to use
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
    render() {
        this.props.group.clear();

        let regionWidth = this.props.displayedRegion.getWidth();

        // If one wanted MAX_MAJOR_TICKS to represent the min number of ticks, use Math.floor() instead.
        let log10BasesPerMajorTick = Math.ceil(Math.log10(regionWidth / MAX_MAJOR_TICKS));
        let basesPerMajorTick = Math.pow(10, log10BasesPerMajorTick); // Thus ensuring each major tick is a power of 10.
        let pixelsPerMajorTick = this.props.drawModel.basesToXWidth(basesPerMajorTick);
        let pixelsPerMinorTick = pixelsPerMajorTick / MINOR_TICKS;
        let unit = this._getMajorUnit(log10BasesPerMajorTick);

        // The horizontal line spanning the width of the ruler
        let rulerLine = this.props.group.line(0, 0, this.props.drawModel.getDrawWidth(), 0);
        rulerLine.stroke({width: 1, color: '#bbb'});

        const intervals = this.props.displayedRegion.getFeatureIntervals();
        for (let interval of intervals) {
            // relativeBase = round down to the nearest major tick base for this region, to find where to start drawing
            let relativeBase = Math.floor(interval.relativeStart / basesPerMajorTick) * basesPerMajorTick;
            let featureAbsStart = this.props.displayedRegion.getNavigationContext().getFeatureStart(interval.getName());
            let majorX = this.props.drawModel.baseToX(featureAbsStart + relativeBase);
            let majorTickEndX = this.props.drawModel.baseToX(featureAbsStart + interval.relativeEnd);

            // This loop updates relativeBase and majorX every iteration
            // Draw major and minor ticks for this region (chromosome)
            while (majorX < majorTickEndX) {
                // The major tick line
                let majorTickLine = this.props.group.line(majorX, -MAJOR_TICK_HEIGHT, majorX, 0);
                majorTickLine.stroke({width: 2, color: '#bbb'});

                // Label for the major tick
                if (relativeBase > 0) {
                    this.props.group.text(relativeBase / unit.size + unit.name).attr({
                        x: majorX,
                        y: 0 + 10,
                        "text-anchor": "middle",
                    });
                }

                // Minor ticks
                let minorX = majorX + pixelsPerMinorTick;
                let minorTickEndX = Math.min(majorX + pixelsPerMajorTick, majorTickEndX);
                while (minorX < minorTickEndX) {
                    let minorTickLine = this.props.group.line(minorX, -MINOR_TICK_HEIGHT, minorX, 0);
                    minorTickLine.stroke({width: 2, color: '#bbb'});
                    minorX += pixelsPerMinorTick
                }

                // Update major tick loop vars
                relativeBase += basesPerMajorTick;
                majorX += pixelsPerMajorTick;
            } // End while (majorX < majorTickEndX) { ... }
        } // End for (let region of regionList) { ... }

        return null;
    }
}

export default withSvgJs(Ruler);
