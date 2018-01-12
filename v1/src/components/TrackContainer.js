import React from 'react';
import PropTypes from 'prop-types';

import GenericDraggable from './GenericDraggable';
import GenericDroppable from './GenericDroppable';
import TrackLegend from './TrackLegend';
import { Track } from './Track';
import { LEFT_MOUSE } from './DragAcrossDiv';
import DragAcrossView from './DragAcrossView';

import DisplayedRegionModel from '../model/DisplayedRegionModel';

const VIEW_EXPANSION_VALUE = 1;

/**
 * Contains all tracks and makes tracks from TrackModel objects.  Also handles track dragging.
 * 
 * @author Silas Hsu
 */
class TrackContainer extends React.Component {
    static MIN_DRAG_DISTANCE_FOR_REFRESH = 20;

    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Current track view region
        /**
         * Called whenever a track requests that the view be changed, such as when a track is dragged.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the new view interval
         *         `newEnd`: the absolute base number of the end of the new view interval
         */
        newRegionCallback: PropTypes.func.isRequired,
        tracks: PropTypes.arrayOf(PropTypes.object).isRequired, // The tracks to display.  Array of TrackModel.

        /**
         * Called when tracks are reordered.  Signature: (newOrder: TrackModel[]): void
         */
        onTracksReordered: PropTypes.func,
    };

    static defaultProps = {
        onTracksReordered: () => undefined
    };

    constructor(props) {
        super(props);
        this.state = {
            width: 0,
            xOffsets: Array(props.tracks.length).fill(0),
            allowReorder: false,
        };
        this.offsetsOnDragStart = this.state.xOffsets;
        this.node = null;

        this.viewDragStart = this.viewDragStart.bind(this);
        this.viewDrag = this.viewDrag.bind(this);
        this.viewDragEnd = this.viewDragEnd.bind(this);
        this.newTrackDataCallback = this.newTrackDataCallback.bind(this);
        this.renderTrack = this.renderTrack.bind(this);
        this.trackDropped = this.trackDropped.bind(this);
    }

    componentDidMount() {
        this.setState({width: this.node.clientWidth});
    }

    /**
     * Saves the current track draw offsets.
     * 
     * @param {React.SyntheticEvent} event - the event the triggered this
     */
    viewDragStart(event) {
        event.preventDefault();
        this.offsetsOnDragStart = this.state.xOffsets.slice();
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
        let newOffsets = this.offsetsOnDragStart.map(initOffset => initOffset + coordinateDiff.dx);
        this.setState({xOffsets: newOffsets});
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
        if (Math.abs(coordinateDiff.dx) >= TrackContainer.MIN_DRAG_DISTANCE_FOR_REFRESH) {
            this.props.newRegionCallback(newStart, newEnd);
        }
    }

    /**
     * Resets the draw offset for a track when it has loaded new data.
     * 
     * @param {number} index - the index of the track that got new data
     */
    newTrackDataCallback(index) {
        let newOffsets = this.state.xOffsets.slice();
        newOffsets[index] = 0;
        this.setState({xOffsets: newOffsets});
    }

    getTrackWidth() {
        return Math.max(0, this.state.width - TrackLegend.WIDTH);
    }

    /**
     * Make a single track component with the input TrackModel.
     * 
     * @param {TrackModel} trackModel - model to use to create the track
     * @param {number} index - index of the track in this.props.tracks
     * @return {Track} track component to render
     */
    renderTrack(trackModel, index) {
        if (!trackModel) {
            return null;
        }

        let trackProps = {
            trackModel: trackModel,
            viewRegion: this.props.viewRegion,
            viewExpansionValue: VIEW_EXPANSION_VALUE,

            width: this.getTrackWidth(),
            xOffset: this.state.xOffsets[index],
            onNewData: () => this.newTrackDataCallback(index)
        };
        
        return (
        <GenericDraggable
            key={trackModel.getId()}
            draggableId={trackModel.getId()}
            isDragDisabled={!this.state.allowReorder}
        >
           <Track {...trackProps} />
        </GenericDraggable>
        );
    }

    trackDropped(dragResult) {
        if (!dragResult.destination) {
            return;
        }
        let newOrder = this.props.tracks.slice();
        const [moved] = newOrder.splice(dragResult.source.index, 1);
        newOrder.splice(dragResult.destination.index, 0, moved);
        this.props.onTracksReordered(newOrder);
    }

    render() {
        if (this.state.width === 0) {
            return <div ref={node => this.node = node} />;
        }

        const width = this.getTrackWidth();

        return (
        <GenericDroppable onDrop={this.trackDropped}>
            <button onClick={(event) => this.setState({allowReorder: !this.state.allowReorder})} >
                {(this.state.allowReorder ? "Dis" : "En") + "able track drag-and-drop"}
            </button>
            <DragAcrossView
                ref={node => this.node = node}
                style={{margin: "10px", border: "1px solid grey"}}
                button={LEFT_MOUSE}
                onViewDragStart={this.viewDragStart}
                onViewDrag={this.viewDrag}
                onViewDragEnd={this.viewDragEnd}
                displayedRegion={this.props.viewRegion}
                widthOverride={width}
            >
                {this.props.tracks.map(this.renderTrack)}
            </DragAcrossView>
        </GenericDroppable>
        );
    }
}

export default TrackContainer;
