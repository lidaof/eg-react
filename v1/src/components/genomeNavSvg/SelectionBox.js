import PropTypes from 'prop-types';
import SvgComponent from './SvgComponent';

const SELECT_REGION_BUTTON = 0; // Left mouse
// FYI, {0: left mouse, 1: middle mouse, 2: right mouse}
const SELECT_BOX_HEIGHT = 60;


/**
 * Creates and manages the boxes that the user can drag across the screen to select a new region. 
 * 
 * @author Silas Hsu
 */
class SelectionBox extends SvgComponent {
    /**
     * Attaches event listeners.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.box = null;
        this.anchorX = 0;

        this.props.svg.on('mousedown', this.mousedown, this);
        this.props.svg.on('mousemove', this.mousemove, this);
        this.props.svg.on('mouseup', this.mouseupOrMouseleave, this);
        this.props.svg.on('mouseleave', this.mouseupOrMouseleave, this);
    }

    /**
     * Adds the selection box to the SVG, if one doesn't already exist.
     * 
     * @param {number} anchorX - the x coordinate where the box is to be anchored
     */
    _addBox(anchorX) {
        if (this.box !== null) {
            return;
        }
        this.anchorX = anchorX;

        this.box = this.group.rect();
        this.box.attr({
            x: this.anchorX,
            y: 0,
            width: 1,
            height: SELECT_BOX_HEIGHT,
            stroke: "#009",
            fill: "#00f",
            "fill-opacity": 0.1,
        });
    }

    /**
     * Initializes the selection box, if the correct mouse button was pressed down.
     * 
     * @param {MouseEvent} event - a mousedown event fired from within this pane
     */
    mousedown(event) {
        event.preventDefault();
        if (event.button === SELECT_REGION_BUTTON) {
            this._addBox(this.domXToSvgX(event.clientX));
        }
    }

    /**
     * Redraws the box according to where the mouse is.
     * 
     * @param {MouseEvent} event - mousemove event fired from the svg
     */
    mousemove(event) {
        if (!this.box) {
            return;
        }

        let mouseX = this.domXToSvgX(event.clientX)
        let distance = mouseX - this.anchorX + 1;
        if (distance > 0) { // Moved right compared to drag start
            this.box.x(this.anchorX);
            this.box.width(distance);
        } else { // Ditto, but left
            this.box.x(mouseX);
            this.box.width(-distance);
        }
    }

    /**
     * Calcuates the region that the box currently envelops, and propagates the information to the parent component.
     * 
     * @param {MouseEvent} event - mouseup or mouseleave event fired from the svg
     */
    mouseupOrMouseleave(event) {
        if (!this.box) {
            return;
        }
        
        let startBase = this.xToBase(this.box.x());
        let endBase = this.xToBase(this.box.x() + this.box.width());
        this.box.remove();
        this.box = null;

        this.props.regionSelectedCallback(startBase, endBase);
    }

    /**
     * Removes this group and event listeners.
     * 
     * @override
     */
    componentWillUnmount() {
        this.group.remove();
        this.props.svg.off('mousedown', this.mousedown);
        this.props.svg.off('mousemove', this.mousemove);
        this.props.svg.off('mouseup', this.mouseupOrMouseleave);
        this.props.svg.off('mouseleave', this.mouseupOrMouseleave);
    }
}

SelectionBox.propTypes = {
    regionSelectedCallback: PropTypes.func.isRequired, // Function that takes arguments [number, number]
}

export default SelectionBox;
