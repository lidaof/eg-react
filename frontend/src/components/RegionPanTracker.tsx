import React from 'react';
import Hammer from 'react-hammerjs';
import { CoordinateDiff } from './DragAcrossDiv';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import { MouseButton } from '../util';
import OpenInterval from '../model/interval/OpenInterval';

interface RegionPanTrackProps {
    mouseButton: MouseButton; // Mouse button used to pan
    panRegion: DisplayedRegionModel; // The region to use in pan calculations

    /**
     * Affects calculations of how many bases the user has panned.  If not provided, the component will compute a
     * reasonable default from the container's width.
     */
    basesPerPixel: number;

    /**
     * Callback for when dragging starts.
     * 
     * @param {React.MouseEvent} event - the event that triggered this callback
     */
    onViewDragStart?(event: React.MouseEvent): void;

    /**
     * Callback for each little bit of movement during a pan.
     * 
     * @param {number} newStart - nav context coordinate of the start of the panned view region
     * @param {number} newEnd - nav context coordinate of the end of the panned view region
     * @param {React.MouseEvent} event - the event that triggered this callback
     * @param {CoordinateDiff} coordinateDiff - how far the mouse has moved since the drag started
     */
    onViewDrag?(newStart: number, newEnd: number, event: React.MouseEvent, coordinateDiff: CoordinateDiff): void;

    /**
     * Callback for when the user lets go of the mouse and stops panning.  Same signature as onViewDrag.
     */
    onViewDragEnd?(newStart: number, newEnd: number, event: React.MouseEvent, coordinateDiff: CoordinateDiff): void;
}

/**
 * Same as {@link DragAcrossDiv}, but also calculates changes in view region as the result of the drag.
 * 
 * @author Silas Hsu
 * @author Shane Liu
 */
export class RegionPanTracker extends React.Component<RegionPanTrackProps> {
    private dragOriginRegion: DisplayedRegionModel;

    constructor(props: RegionPanTrackProps) {
        super(props);
        this.dragOriginRegion = null;

        this.dragStart = this.dragStart.bind(this);
        this.drag = this.drag.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
    }

    /**
     * Initializes view dragging.  Signals that dragging has started to the callback passed in via props.
     * 
     * @param {React.MouseEvent} event - mouse event that signals a drag start
     */
    dragStart(event: React.MouseEvent): void {
        this.dragOriginRegion = this.props.panRegion;
        if (this.props.onViewDragStart) {
            this.props.onViewDragStart(event);
        }
    }

    /**
     * If view dragging has been initialized, calcuates a new view region depending on where the mouse has been dragged.
     * Then gives this information to the callback passed in via props.
     * 
     * @param {React.MouseEvent} event - a mousemove event fired from within this pane
     * @param {CoordinateDiff} coordinateDiff - how far the mouse has moved since drag start
     */
    drag(event: React.MouseEvent, coordinateDiff: CoordinateDiff): void {
        if (this.props.onViewDrag) {
            const newRegion = this._getRegionOffsetByX(this.dragOriginRegion, event, coordinateDiff.dx);
            this.props.onViewDrag(newRegion.start, newRegion.end, event, coordinateDiff);
        }
    }

    /**
     * Uninitializes view dragging.  Also calcuates a new view region depending on where the mouse has been dragged.
     * Then gives this information to the callback passed in via props.
     * 
     * @param {MouseEvent} event - mouse event that signals a drag end
     * @param {CoordinateDiff} coordinateDiff - how far the mouse has moved since drag start
     */
    dragEnd(event: React.MouseEvent, coordinateDiff: CoordinateDiff): void {
        if (this.props.onViewDragEnd) {
            const newRegion = this._getRegionOffsetByX(this.dragOriginRegion, event, coordinateDiff.dx);
            this.props.onViewDragEnd(newRegion.start, newRegion.end, event, coordinateDiff);
        }
    }

    /**
     * Calculates the displayed region panned by some number of pixels.  Does not modify any of the inputs.
     * 
     * @param {DisplayedRegionModel} region - drawing model used to convert from pixels to bases
     * @param {React.MouseEvent} event - the mouse event from dragging
     * @param {number} xDiff - number of pixels to pan the region
     * @return {object} - region resulting from panning the input region
     */
    _getRegionOffsetByX(region: DisplayedRegionModel, event: React.MouseEvent, xDiff: number): OpenInterval {
        const basesPerPixel = this.props.basesPerPixel ||
            (this.props.panRegion.getWidth() / event.currentTarget.clientWidth);
        // Why -1?  When the mouse moves to the right, parts on the left move into view.  Ergo, we're moving the view
        // region to the left.  Vice-versa for moving the mouse to the left.
        const baseDiff = Math.round(-1 * basesPerPixel * xDiff);
        const navContext = region.getNavigationContext();
        const [start, end] = region.getContextCoordinates();

        const newStart = navContext.toGaplessCoordinate(Math.max(0, start + baseDiff));
        const newEnd = navContext.toGaplessCoordinate(Math.min(end + baseDiff, navContext.getTotalBases() - 1));
        return new OpenInterval(newStart, newEnd);
    }

    render(): JSX.Element {
        const {
            children,
        } = this.props;

        return (
            <Hammer
                onPanStart={() => this.dragStart(null)}
                onPan={e => this.drag(null, { dx: e.deltaX, dy: e.deltaY })}
                onPanEnd={e => this.dragEnd(null, { dx: e.deltaX, dy: e.deltaY })}
            >
                <div>
                    {children}
                </div>
            </Hammer>
        );
    }
}
