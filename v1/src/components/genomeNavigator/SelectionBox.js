import DomDragListener from '../DomDragListener';
import PropTypes from 'prop-types';
import React from 'react';
import SvgComponent from '../SvgComponent';

const SELECT_BOX_HEIGHT = 60;

/**
 * Creates and manages the boxes that the user can drag across the screen to select a new region.  If we wanted to 
 * completely stick with React convention, a parent component should be listening for the mouse events and pass the
 * box's size/position through props.  However, putting everything here seemed to simplify and encapsulate code better.
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

        this.dragStart = this.dragStart.bind(this);
        this.drag = this.drag.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
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

        this.box = this.group.rect(1, SELECT_BOX_HEIGHT);
        this.box.attr({
            x: this.anchorX,
            y: 0,
            stroke: "#009",
            fill: "#00f",
            "fill-opacity": 0.1,
        });
    }

    /**
     * Initializes the selection box
     * 
     * @param {MouseEvent} event - a mousedown event signaling a drag start
     */
    dragStart(event) {
        event.preventDefault();
        this._addBox(this.props.drawModel.domXToSvgX(event.clientX));
    }

    /**
     * 
     */
    drag(event, coordinateDiff) {
        if (!this.box) {
            return;
        }

        let xDiff = coordinateDiff.dx;
        if (xDiff > 0) { // Moved right compared to drag start
            this.box.x(this.anchorX);
            this.box.width(xDiff);
        } else { // Ditto, but left
            let width = -xDiff;
            this.box.x(this.anchorX - width);
            this.box.width(width);
        }
    }

    /**
     * 
     */
    dragEnd() {
        if (!this.box) {
            return;
        }
        let startBase = this.props.drawModel.xToBase(this.box.x());
        let endBase = startBase + this.props.drawModel.xWidthToBases(this.box.width());

        this.box.remove();
        this.box = null;

        this.props.regionSelectedCallback(startBase, endBase);
    }

    render() {
        return (
        <DomDragListener
            button={this.props.button}
            onDragStart={this.dragStart}
            onDrag={this.drag}
            onDragEnd={this.dragEnd}
            node={this.props.svgNode}
        />
        );
    }
}

SelectionBox.propTypes = {
    button: PropTypes.number.isRequired,
    regionSelectedCallback: PropTypes.func.isRequired, // Function that takes arguments [number, number]
}

export default SelectionBox;
