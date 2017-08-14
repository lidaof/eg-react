class SvgComponent {

    constructor(parentSvg, displayedRegionModel) {
        this.svg = parentSvg;
        this.group = parentSvg.group();
        this.model = displayedRegionModel;
    }

    getSvgWidth() {
        return this.svg.viewbox().width;
    }

    basesToXWidth(bases) {
        let pixelsPerBase = this.getSvgWidth() / this.model.getWidth();
        return bases * pixelsPerBase;
    }

    xWidthToBases(pixels) {
        let basesPerPixel = this.model.getWidth() / this.getSvgWidth();
        return pixels * basesPerPixel;
    }

    baseToX(base) {
        let pixelsPerBase = this.getSvgWidth() / this.model.getWidth();
        return (base - this.model.getAbsoluteRegion().start) * pixelsPerBase;
    }

    xToBase(pixel) {
        let basesPerPixel = this.model.getWidth() / this.getSvgWidth();
        return pixel * basesPerPixel + this.model.getAbsoluteRegion().start;
    }

    domXToSvgX(domX) {
        return domX - this.svg.node.getBoundingClientRect().left;
    }

    offsetBy(x, y) {
        this.group.transform({x: x, y: y});
        return this;
    }

    redraw() {

    }

    remove() {
        this.group.remove();
    }
}

export default SvgComponent;
