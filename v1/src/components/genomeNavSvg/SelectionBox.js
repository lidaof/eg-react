import SvgComponent from './SvgComponent';

const SELECT_BOX_HEIGHT = 60;

class SelectionBox extends SvgComponent {
    constructor(props) {
        super(props);

        this.box = this.group.rect();
        this.box.attr({
            x: this.props.anchorX,
            y: 0,
            width: 1,
            height: SELECT_BOX_HEIGHT,
            stroke: "#009",
            fill: "#00f",
            "fill-opacity": 0.1,
        });
        this.mouseX = this.props.anchorX;
        this.draw();

        this.props.svg.on('mousemove', this.mousemove, this);
        this.props.svg.on('mouseup', this.mouseupOrMouseleave, this);
        this.props.svg.on('mouseleave', this.mouseupOrMouseleave, this);
    }

    mousemove(event) {
        this.mouseX = this.domXToSvgX(event.clientX)
        this.draw();
    }

    draw() {
        let distance = this.mouseX - this.props.anchorX + 1;
        if (distance > 0) { // Moved right compared to drag start
            this.box.x(this.props.anchorX);
            this.box.width(distance);
        } else { // Ditto, but left
            this.box.x(this.mouseX);
            this.box.width(-distance);
        }
    }

    mouseupOrMouseleave(event) {
        let startBase = this.xToBase(this.box.x());
        let endBase = this.xToBase(this.box.x() + this.box.width());
        this.props.regionSelectedCallback(startBase, endBase);
    }

    componentWillUnmount() {
        this.group.remove();
        this.props.svg.off('mousemove', this.mousemove);
        this.props.svg.off('mouseup', this.mouseupOrMouseleave);
        this.props.svg.off('mouseleave', this.mouseupOrMouseleave);
    }
}

export default SelectionBox;
