import SvgComponent from './SvgComponent';

const SELECT_BOX_HEIGHT = 60;

class SelectionBox extends SvgComponent {
    constructor(parentSvg, displayedRegionModel, anchorX, regionSelectedCallback) {
        super(parentSvg, displayedRegionModel);
        this.anchorX = anchorX;
        this.mouseX = anchorX;
        this.regionSelectedCallback = regionSelectedCallback;

        this.box = this.svg.rect();
        this.box.attr({
            x: anchorX,
            y: 0,
            width: 1,
            height: SELECT_BOX_HEIGHT,
            stroke: "#009",
            fill: "#00f",
            "fill-opacity": 0.1,
        });

        this.svg.on('mousemove', this.mousemove, this);
        this.svg.on('mouseup', this.mouseupOrMouseleave, this);
        this.svg.on('mouseleave', this.mouseupOrMouseleave, this);
    }

    offsetBy(x, y) {
        this.box.transform({x: x, y: y});
        return this;
    }

    redraw() {
        let distance = this.mouseX - this.anchorX;
        if (distance > 0) { // Moved right compared to drag start
            this.box.x(this.anchorX);
            this.box.width(distance);
        } else { // Ditto, but left
            this.box.x(this.mouseX);
            this.box.width(-distance);
        }
    }

    mousemove(event) {
        this.mouseX = this.domXToSvgX(event.clientX);
        this.redraw();
    }

    mouseupOrMouseleave(event) {
        let startBase = this.xToBase(this.box.x());
        let endBase = this.xToBase(this.box.x() + this.box.width());
        this.regionSelectedCallback(startBase, endBase);
    }

    remove() {
        this.box.remove();
        this.svg.off('mousemove', this.mousemove);
        this.svg.off('mouseup', this.mouseupOrMouseleave);
        this.svg.off('mouseleave', this.mouseupOrMouseleave);
    }
}

export default SelectionBox;
