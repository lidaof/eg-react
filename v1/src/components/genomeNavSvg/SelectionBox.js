import PropTypes from 'prop-types';
import SvgComponent from './SvgComponent';

const SELECT_BOX_HEIGHT = 60;

/**
 * A box that the user can drag across the screen to select a new region.
 * 
 * @author Silas Hsu
 */
class SelectionBox extends SvgComponent {
    /**
     * Creates the box and attaches event listeners.
     * 
     * @param {Object} props - props as specified by React
     */
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

        this.props.svg.on('mousemove', this.mousemove, this);
        this.props.svg.on('mouseup', this.mouseupOrMouseleave, this);
        this.props.svg.on('mouseleave', this.mouseupOrMouseleave, this);
    }

    /**
     * Redraws the box according to where the mouse is.
     * 
     * @param {MouseEvent} event - mousemove event fired from the svg
     */
    mousemove(event) {
        this.mouseX = this.domXToSvgX(event.clientX)
        this.render();
    }

    /**
     * Calcuates the region that the box currently envelops, and propagates the information to the parent component.
     * 
     * @param {MouseEvent} event - mouseup or mouseleave event fired from the svg
     */
    mouseupOrMouseleave(event) {
        let startBase = this.xToBase(this.box.x());
        let endBase = this.xToBase(this.box.x() + this.box.width());
        this.props.regionSelectedCallback(startBase, endBase);
    }

    /**
     * Removes this group and event listeners.
     * 
     * @override
     */
    componentWillUnmount() {
        this.group.remove();
        this.props.svg.off('mousemove', this.mousemove);
        this.props.svg.off('mouseup', this.mouseupOrMouseleave);
        this.props.svg.off('mouseleave', this.mouseupOrMouseleave);
    }

    /**
     * Draws the box such that one edge is at the mouse's location and other other edge is at anchorX.
     * 
     * @override
     */
    render() {
        let distance = this.mouseX - this.props.anchorX + 1;
        if (distance > 0) { // Moved right compared to drag start
            this.box.x(this.props.anchorX);
            this.box.width(distance);
        } else { // Ditto, but left
            this.box.x(this.mouseX);
            this.box.width(-distance);
        }
        return null;
    }
}

SelectionBox.propTypes = {
    anchorX: PropTypes.number.isRequired,
    regionSelectedCallback: PropTypes.func.isRequired, // Function that takes arguments [number, number]
}

export default SelectionBox;
