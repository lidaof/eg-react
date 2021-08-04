import React from 'react';
import PropTypes from 'prop-types';

import Hammer from 'react-hammerjs';
import { MouseButton } from '../../util';
import { RegionPanTracker } from '../RegionPanTracker';

/**
 * Track container where dragging across scrolls the view region.
 * 
 * @author Silas Hsu
 */
export class PannableTrackContainer extends React.Component {
    static MIN_DRAG_DISTANCE_FOR_REFRESH = 20;

    static propTypes = {
        trackElements: PropTypes.arrayOf(PropTypes.object).isRequired, // Track components to render
        visData: PropTypes.object.isRequired,
        /**
         * Callback for when a new region is selected.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the new view interval
         *         `newEnd`: the nav context coordinate of the end of the new view interval
         */
        onNewRegion: PropTypes.func,
    };

    static defaultProps = {
        onNewRegion: () => undefined
    };

    constructor(props) {
        super(props);
        this.offsetOnDragStart = 0;
        this.viewDragStart = this.viewDragStart.bind(this);
        this.viewDrag = this.viewDrag.bind(this);
        this.viewDragEnd = this.viewDragEnd.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
    }

    /**
     * Add event listeners to the track region. Prevents event default so we can drag the view region.
     **/
    componentDidMount() {
        this.trackRegion.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    }

    /**
     * Remove the event listener on unmount.
     **/
    componentWillUnmount() {
        this.trackRegion.removeEventListener('touchmove', this.handleTouchMove);
    }

    /**
     * Saves the current track draw offsets.
     * 
     * @param {React.SyntheticEvent | null} event - the event the triggered this
     */
    viewDragStart(event) {
        event && event.preventDefault();
        this.offsetOnDragStart = this.props.xOffset;
    }

   /**
     * Called when the user drags the track around.  Sets track draw offsets.
     * 
     * @param {any} [unused] - unused
     * @param {any} [unused2] - unused
     * @param {React.SyntheticEvent} [unusedEvent] - unused
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    viewDrag(unused, unused2, unusedEvent, coordinateDiff) {
        const {visWidth, viewWindow} = this.props.visData;
        const numPixelsOnLeft = viewWindow.start;
        const numPixelsOnRight = visWidth - viewWindow.end;
        const newXOffset = this.offsetOnDragStart + coordinateDiff.dx;
        /*
        Dragging LEFT, or NEGATIVE xOffset, puts pixels on the right into view.  Limit drag to the number of pixels on
        the right.
        Dragging RIGHT, or POSITIVE xOffset, puts pixels on the left into view.  Limit drag to the number of pixels on
        the left.
        */
        if (-numPixelsOnRight < newXOffset && newXOffset < numPixelsOnLeft) {
            this.props.onXOffsetChanged(newXOffset);
        }
    }

    /**
     * Called when the user finishes dragging the track, signaling a new track display region.
     * 
     * @param {number} newStart - start of the new display region in nav context coordinates
     * @param {number} newEnd - end of the new display region in nav context coordinates
     * @param {React.SyntheticEvent} [unusedEvent] - unused
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    viewDragEnd(newStart, newEnd, unusedEvent, coordinateDiff) {
        if (Math.abs(coordinateDiff.dx) >= PannableTrackContainer.MIN_DRAG_DISTANCE_FOR_REFRESH) {
            this.props.onNewRegion(newStart, newEnd);
        }
    }

    /**
     * Resets the draw offset for the tracks when getting a new region.
     */
    UNSAFE_componentWillReceiveProps(newProps) {
        if (this.props.visData !== newProps.visData) {
            this.props.onXOffsetChanged(0);
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
    }

    /**
     * @inheritdoc
     */
    render() {
        const { trackElements, visData, xOffset } = this.props;
        const { visRegion, visWidth, viewWindowRegion } = visData;
        const tracksWithXOffset = trackElements.map( // Give xOffset to tracks
            trackElement => React.cloneElement(trackElement, { xOffset })
        );

        return (
            <div ref={ref => this.trackRegion = ref}>
                <RegionPanTracker
                    mouseButton={MouseButton.LEFT}
                    onViewDragStart={this.viewDragStart}
                    onViewDrag={this.viewDrag}
                    onViewDragEnd={this.viewDragEnd}
                    panRegion={viewWindowRegion}
                    basesPerPixel={visRegion.getWidth() / visWidth}
                >
                    {tracksWithXOffset}
                </RegionPanTracker>
            </div>
        );
    }
}