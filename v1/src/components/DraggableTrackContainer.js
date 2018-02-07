import React from 'react';
import PropTypes from 'prop-types';

import { LEFT_MOUSE } from './DragAcrossDiv';
import DragAcrossView from './DragAcrossView';

import DisplayedRegionModel from '../model/DisplayedRegionModel';

/**
 * Track container where dragging across scrolls the view region.
 * 
 * @author Silas Hsu
 */
class DraggableTrackContainer extends React.Component {
    static MIN_DRAG_DISTANCE_FOR_REFRESH = 20;

    static propTypes = {
        trackComponents: PropTypes.arrayOf(PropTypes.object).isRequired, // Track components to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // View region of the tracks
        visualizationWidth: PropTypes.number.isRequired, // Width of the visible portion of tracks
        /**
         * Callback for when a new region is selected.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the new view interval
         *         `newEnd`: the absolute base number of the end of the new view interval
         */
        onNewRegion: PropTypes.func,
    };

    static defaultProps = {
        onNewRegion: () => undefined
    };

    constructor(props) {
        super(props);
        this.state = {
            xOffset: 0
        };
        this.offsetOnDragStart = 0;
        this.viewDragStart = this.viewDragStart.bind(this);
        this.viewDrag = this.viewDrag.bind(this);
        this.viewDragEnd = this.viewDragEnd.bind(this);
    }

    /**
     * Saves the current track draw offsets.
     * 
     * @param {React.SyntheticEvent} event - the event the triggered this
     */
    viewDragStart(event) {
        event.preventDefault();
        this.offsetOnDragStart = this.state.xOffset;
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
        this.setState({xOffset: this.offsetOnDragStart + coordinateDiff.dx});
    }

    /**
     * Called when the user finishes dragging the track, signaling a new track display region.
     * 
     * @param {number} newStart - absolute start base pair of the new display region
     * @param {number} newEnd - absolute end base number of the new display region
     * @param {React.SyntheticEvent} [unusedEvent] - unused
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    viewDragEnd(newStart, newEnd, unusedEvent, coordinateDiff) {
        if (Math.abs(coordinateDiff.dx) >= DraggableTrackContainer.MIN_DRAG_DISTANCE_FOR_REFRESH) {
            this.props.onNewRegion(newStart, newEnd);
        }
    }

    /**
     * Resets the draw offset for the tracks when getting a new region.
     */
    componentWillReceiveProps(newProps) {
        if (this.props.viewRegion !== newProps.viewRegion) {
            this.setState({xOffset: 0});
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        // Add keys
        let modifiedTracks = this.props.trackComponents.map((trackComponent, index) => {
            const key = trackComponent.props.trackModel ? trackComponent.props.trackModel.getId() : index;
            const propsToMerge = {
                key: key,
                xOffset: this.state.xOffset
            };
            return React.cloneElement(trackComponent, propsToMerge);
        });

        return (
        <DragAcrossView
            button={LEFT_MOUSE}
            onViewDragStart={this.viewDragStart}
            onViewDrag={this.viewDrag}
            onViewDragEnd={this.viewDragEnd}
            viewRegion={this.props.viewRegion}
            widthOverride={this.props.visualizationWidth}
        >
            {modifiedTracks}
        </DragAcrossView>
        );
    }
}

export default DraggableTrackContainer;
