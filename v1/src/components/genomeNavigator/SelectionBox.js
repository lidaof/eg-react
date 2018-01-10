import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';

import LinearDrawingModel from '../../model/LinearDrawingModel';
import DomDragListener from '../DomDragListener';
import withSvgJs from '../withSvgJs';

const SELECT_BOX_HEIGHT = 60;

function domXToSvgX(domX, svgNode) {
    return domX - svgNode.getBoundingClientRect().left;
}

/**
 * Creates and manages the boxes that the user can drag across the screen to select a new region.  If we wanted to 
 * completely stick with React convention, a parent component should be listening for the mouse events and pass the
 * box's size/position through props.  However, putting everything here seemed to simplify and encapsulate code better.
 * 
 * @author Silas Hsu
 */
class SelectionBox extends React.Component {
    static propTypes = {
        /**
         * <svg> ref on which to draw
         */
        svgNode: process.env.NODE_ENV !== "test" ? PropTypes.instanceOf(SVGElement) : () => undefined,
        group: PropTypes.instanceOf(SVG.Element).isRequired, // An object from SVG.js to draw in
        drawModel: PropTypes.instanceOf(LinearDrawingModel).isRequired, // The drawing model to use

        /**
         * The mouse button for which the box should activate; see DomDragListener for valid values.
         */
        button: PropTypes.number.isRequired,

        /**
         * Called when the user lets go of the mouse, selecting a region.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the selected interval
         *         `newEnd`: the absolute base number of the end of the selected interval
         */
        regionSelectedCallback: PropTypes.func.isRequired,
    }

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

        this.box = this.props.group.rect(1, SELECT_BOX_HEIGHT);
        this.box.attr({
            x: this.anchorX,
            y: 0,
            stroke: "#009",
            fill: "#00f",
            "fill-opacity": 0.1,
        });
    }

    /**
     * Initializes the selection box.
     * 
     * @param {MouseEvent} event - a mousedown event signaling a drag start
     */
    dragStart(event) {
        event.preventDefault();
        this._addBox(domXToSvgX(event.clientX, this.props.svgNode));
    }

    /**
     * Called when the mouse changes position while dragging.
     * 
     * @param {MouseEvent} event - the mouse event
     * @param {object} coordinateDiff - object describing difference in coordinates relative to the drag's start
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
     * Called when the user lets go of the mouse after a drag.
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

    /**
     * @inheritdoc
     */
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

export default withSvgJs(SelectionBox);
