import React from 'react';
import PropTypes from 'prop-types';

import DragAcrossDiv from './DragAcrossDiv';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';

/**
 * Same as {@link DragAcrossDiv}, but also calculates changes in view region as the result of the drag.
 * 
 * @author Silas Hsu
 */
class DragAcrossView extends React.Component {
    static propTypes = {
        button: PropTypes.number.isRequired, // Mouse button to listen to.  See DragAcrossDiv for a selection.

        /**
         * The current displayed region; used to calculate how many base pairs the user has dragged.
         */
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        /**
         * Overrides the width of the container when calculating how many bases the user has dragged.  Does not affect
         * the actual display width.
         */
        widthOverride: PropTypes.number,

        /**
         * Called when dragging has started.  Note that a click will also fire this event.  Has the signature
         *     (event: MouseEvent): void
         */
        onViewDragStart: PropTypes.func,

        /**
         * Called during dragging, when the user has not let go of the mouse and is moving it around.  Has the signature
         *     (newStart: number, newEnd: number, event: MouseEvent, coordinateDiff: {dx: number, dy: number}): void
         *         `newStart`: nav context coordinate of the start of the view region if it were centered on the mouse
         *         `newEnd`: nav context coordinate of the end of the view region if it were centered on the mouse
         *         `event`: the MouseEvent that triggered this event
         *         `coordinateDiff`: the location of the mouse relative to where the drag started
         */
        onViewDrag: PropTypes.func,

        /**
         * Called when dragging has ended; i.e. the user let go of the mouse button.  Same signature as onViewDrag.
         */
        onViewDragEnd: PropTypes.func,
    };

    static defaultProps = {
        onViewDragStart: () => undefined,
        onViewDrag: () => undefined,
        onViewDragEnd: () => undefined,
    };

    constructor(props) {
        super(props);
        this.dragOriginRegion = this.props.viewRegion;

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
        this.dragOriginRegion = this.props.viewRegion;
        this.props.onViewDragStart(event);
    }

    /**
     * If view dragging has been initialized, calcuates a new view region depending on where the mouse has been dragged.
     * Then gives this information to the callback passed in via props.
     * 
     * @param {MouseEvent} event - a mousemove event fired from within this pane
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    drag(event, coordinateDiff) {
        let newRegion = this._getRegionOffsetByX(this.dragOriginRegion, event, -coordinateDiff.dx);
        this.props.onViewDrag(newRegion.start, newRegion.end, event, coordinateDiff);
    }

    /**
     * Uninitializes view dragging.  Also calcuates a new view region depending on where the mouse has been dragged.
     * Then gives this information to the callback passed in via props.
     * 
     * @param {MouseEvent} event - mouse event that signals a drag end
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    dragEnd(event, coordinateDiff) {
        let newRegion = this._getRegionOffsetByX(this.dragOriginRegion, event, -coordinateDiff.dx);
        this.props.onViewDragEnd(newRegion.start, newRegion.end, event, coordinateDiff);
    }

    /**
     * Calculates the displayed region panned by some number of pixels.  Does not modify any of the inputs.
     * 
     * @param {DisplayedRegionModel} viewRegion - drawing model used to convert from pixels to bases
     * @param {number} xDiff - number of pixels to pan the region
     * @return {object} - region resulting from panning the input region
     */
    _getRegionOffsetByX(viewRegion, event, xDiff) {
        const drawModel = new LinearDrawingModel(
            viewRegion,
            this.props.widthOverride || event.currentTarget.clientWidth
        );
        let baseDiff = drawModel.xWidthToBases(xDiff);
        let startRegion = viewRegion.getContextCoordinates();
        return {
            start: startRegion.start + baseDiff,
            end: startRegion.end + baseDiff,
        }
    }

    render() {
        let {
            viewRegion,
            onViewDragStart,
            onViewDrag,
            onViewDragEnd,
            widthOverride,
            children,
            ...remainingProps
        } = this.props;

        return (
        <DragAcrossDiv
            onDragStart={this.dragStart}
            onDrag={this.drag}
            onDragEnd={this.dragEnd}
            {...remainingProps}
        >
            {children}
        </DragAcrossDiv>
        );
    }
}

export default DragAcrossView;
