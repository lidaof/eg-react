import GenomeNavigatorComponent from './GenomeNavigatorComponent';

const MAX_MAJOR_TICKS = 15;
const MINOR_TICKS = 5;
const MAJOR_TICK_HEIGHT = 10;
const MINOR_TICK_HEIGHT = 5;

class Ruler extends GenomeNavigatorComponent {
    _getMajorUnit(log10BasesPerMajorTick) {
        if (log10BasesPerMajorTick >= 5) { // 10K
            return {
                size: 1000000,
                suffix: "M",
            };
        } else if (log10BasesPerMajorTick > 2) { // 100
            return {
                size: 1000,
                suffix: "K",
            };
        }

        return {
            size: 1,
            suffix: "",
        };
    }

    redraw() {
        this.group.clear();

        let regionWidth = this.model.getWidth();

        // If one wanted MAX_MAJOR_TICKS to represent the min number of ticks, use Math.floor() instead.
        let log10BasesPerMajorTick = Math.ceil(Math.log10(regionWidth / MAX_MAJOR_TICKS));
        let basesPerMajorTick = Math.pow(10, log10BasesPerMajorTick); // Thus ensuring each major tick is a power of 10.
        let pixelsPerMajorTick = this.basesToXWidth(basesPerMajorTick);
        let pixelsPerMinorTick = pixelsPerMajorTick / MINOR_TICKS;
        let unit = this._getMajorUnit(log10BasesPerMajorTick);

        // The horizontal line spanning the width of the ruler
        let rulerLine = this.group.line(0, 0, this.getSvgWidth(), 0);
        rulerLine.stroke({width: 1, color: '#bbb'});

        let regionList = this.model.getRegionList();
        for (let region of regionList) {
            // Round down to the nearest major tick base for this region, to find where to start drawing
            let relativeBase = Math.floor(region.start / basesPerMajorTick) * basesPerMajorTick;
            let majorX = this.baseToX(region.metadata.startBase + relativeBase);
            let majorTickEndX = this.baseToX(region.metadata.startBase + region.end);

            // This loop updates relativeBase and majorX every iteration
            // Draw major and minor ticks for this region (chromosome)
            while (majorX < majorTickEndX) {
                // The major tick line
                let majorTickLine = this.group.line(majorX, -MAJOR_TICK_HEIGHT, majorX, 0);
                majorTickLine.stroke({width: 2, color: '#bbb'});

                // Label for the major tick
                if (relativeBase > 0) {
                    let label = this.group.text(relativeBase / unit.size + unit.suffix);
                    label.move(majorX, 0 + 10);
                    label.font('anchor', 'middle');
                }

                // Minor ticks
                let minorX = majorX + pixelsPerMinorTick;
                let minorTickEndX = Math.min(majorX + pixelsPerMajorTick, majorTickEndX);
                while (minorX < minorTickEndX) {
                    let minorTickLine = this.group.line(minorX, -MINOR_TICK_HEIGHT, minorX, 0);
                    minorTickLine.stroke({width: 2, color: '#bbb'});
                    minorX += pixelsPerMinorTick
                }

                // Update major tick loop vars
                relativeBase += basesPerMajorTick;
                majorX += pixelsPerMajorTick;
            } // End while (majorX < majorTickEndX) { ... }
        } // End for (let region of regionList) { ... }
    }
}

export default Ruler;
