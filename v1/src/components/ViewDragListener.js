import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import DomDragListener from './DomDragListener';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Listens for drag-across events as specified by {@link DomDragListener}, and also calculates changes in view region
 * as the result of the drag.
 * 
 * @author Silas Hsu
 */
class ViewDragListener extends React.Component {
    static propTypes = {
        button: PropTypes.number.isRequired, // The mouse button to listen to.  See DomDragListener for possible values.
        node: PropTypes.object, // The node to listen to.
        svgNode: PropTypes.object, // Fallback if node is not defined; gives compatibility when inside a SvgContainer.

        /**
         * Used to convert number of pixels dragged to number of bases dragged.  Is required, but not marked so to
         * suppress warnings.
         */
        drawModel: PropTypes.instanceOf(LinearDrawingModel),

        /**
         * The current view of the SVG; used to calculate how many base pairs the user has dragged.  Is required, but
         * not marked so to suppress warnings.
         */
        model: PropTypes.instanceOf(DisplayedRegionModel),

        /**
         * Called when dragging has started.  Note that a click will also fire this event.  Has the signature
         *     (event: MouseEvent): void
         */
        onViewDragStart: PropTypes.func,

        /**
         * Called during dragging, when the user has not let go of the mouse and is moving it around.  Has the signature
         *     (newStart: number, newEnd: number, event: MouseEvent, coordinateDiff: {dx: number, dy: number}): void
         *         `newStart`: the absolute base number of the start of the view region if it were centered on the mouse
         *         `newEnd`: the absolute base number of the end of the view region if it were centered on the mouse
         *         `event`: the MouseEvent that triggered this event
         *         `coordinateDiff`: the location of the mouse relative to where the drag started
         */
        onViewDrag: PropTypes.func,

        /**
         * Called when dragging has ended; i.e. the user let go of the mouse button.  Same signature as onViewDrag.
         */
        onViewDragEnd: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.dragOriginModel = null;

        this.dragStart = this.dragStart.bind(this);
        this.drag = this.drag.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
    }

    /**
     * Initializes view dragging.  Signals that dragging has started to the callback passed in via props.
     * 
     * @param {MouseEvent} event - mouse event that signals a drag start
     */
    dragStart(event) {
        this.dragOriginModel = this.props.model;
        if (this.props.onViewDragStart) {
            this.props.onViewDragStart(event);
        }
    }

    /**
     * If view dragging has been initialized, calcuates a new view region depending on where the mouse has been dragged.
     * Then gives this information to the callback passed in via props.
     * 
     * @param {MouseEvent} event - a mousemove event fired from within this pane
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    drag(event, coordinateDiff) {
        if (this.props.onViewDrag && this.dragOriginModel) {
            let newRegion = this._getRegionOffsetByX(this.dragOriginModel, -coordinateDiff.dx);
            this.props.onViewDrag(newRegion.start, newRegion.end, event, coordinateDiff);
        }
    }

    /**
     * Uninitializes view dragging.  Also calcuates a new view region depending on where the mouse has been dragged.
     * Then gives this information to the callback passed in via props.
     * 
     * @param {MouseEvent} event - mouse event that signals a drag end
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    dragEnd(event, coordinateDiff) {
        if (this.props.onViewDragEnd && this.dragOriginModel) {
            let newRegion = this._getRegionOffsetByX(this.dragOriginModel, -coordinateDiff.dx);
            this.props.onViewDragEnd(newRegion.start, newRegion.end, event, coordinateDiff);
        }
        this.dragOriginModel = null;
    }

    /**
     * Calculates the absolute displayed region panned by some number of pixels.  Does not modify any of the inputs.
     * 
     * @param {LinearDrawingModel} model - drawing model used to convert from pixels to bases
     * @param {number} xDiff - number of pixels to pan the region
     * @return {object} - absolute region resulting from panning the input region
     */
    _getRegionOffsetByX(model, xDiff) {
        let baseDiff = this.props.drawModel.xWidthToBases(xDiff);
        let startRegion = model.getAbsoluteRegion();
        return {
            start: startRegion.start + baseDiff,
            end: startRegion.end + baseDiff,
        }
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
                node={this.props.node || this.props.svgNode}
            />
        );
    }
}

export default ViewDragListener;
