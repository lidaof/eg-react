import React from 'react';
import PropTypes from 'prop-types';

import BigWigTrack from './BigWigTrack';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import TrackLegend from './TrackLegend';

import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import RegionExpander from '../model/RegionExpander';

import { LEFT_MOUSE } from './DomDragListener';
import ViewDragListener from './ViewDragListener';

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
    }

    constructor(props) {
        super(props);
        this.state = {
            width: 0,
            xOffsets: Array(props.tracks.length).fill(0)
        };
        this.offsetsOnDragStart = this.state.xOffsets;
        this.node = null;
        this.regionExpander = new RegionExpander(0.75);

        this.viewDragStart = this.viewDragStart.bind(this);
        this.viewDrag = this.viewDrag.bind(this);
        this.viewDragEnd = this.viewDragEnd.bind(this);
        this.newTrackDataCallback = this.newTrackDataCallback.bind(this);
        this.renderTrack = this.renderTrack.bind(this);
    }

    componentDidMount() {
        this.setState({width: this.node.clientWidth});
    }

    /**
     * Saves the current track draw offsets.
     * 
     * @param {MouseEvent} unusedEvent - unused
     */
    viewDragStart(unusedEvent) {
        this.offsetsOnDragStart = this.state.xOffsets.slice();
    }

    /**
     * Called when the user drags the track around.  Sets track draw offsets.
     * 
     * @param {any} [unused] - unused
     * @param {any} [unused2] - unused
     * @param {MouseEvent} [unusedEvent] - unused
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
     * @param {MouseEvent} [event] - unused
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    viewDragEnd(newStart, newEnd, event, coordinateDiff) {
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
            regionExpander: this.regionExpander,

            width: Math.max(0, this.state.width - TrackLegend.WIDTH),
            xOffset: this.state.xOffsets[index],
            onNewData: () => this.newTrackDataCallback(index),
            key: index // TODO make keys NOT index-based
        };
        
        switch (trackModel.getType()) {
            case BigWigTrack.TYPE_NAME.toLowerCase():
                return <BigWigTrack
                    {...trackProps}
                />;
            case GeneAnnotationTrack.TYPE_NAME.toLowerCase():
                return <GeneAnnotationTrack
                    {...trackProps}
                />;
            default:
                console.warn("Unknown track type " + trackModel.type);
                return null;
        }
    }

    render() {
        const drawModel = this.node ?
            new LinearDrawingModel(this.props.viewRegion, this.state.width - TrackLegend.WIDTH, this.node) : undefined;
        return (
            <div ref={node => this.node = node} style={{margin: "10px", border: "1px solid grey"}}>
                {this.props.tracks.map(this.renderTrack)}
                {
                this.node ?
                    <ViewDragListener
                        button={LEFT_MOUSE}
                        node={this.node}
                        drawModel={drawModel}
                        model={this.props.viewRegion}
                        onViewDragStart={this.viewDragStart}
                        onViewDrag={this.viewDrag}
                        onViewDragEnd={this.viewDragEnd}
                    />
                    :
                    null
                }
            </div>
        );
    }
}

export default TrackContainer;
