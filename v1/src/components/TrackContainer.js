import { LEFT_MOUSE } from './DomDragListener';
import ViewDragListener from './ViewDragListener';
import BigWigTrack from './BigWigTrack.js';
import GeneAnnotationTrack from './geneAnnotationTrack/GeneAnnotationTrack';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Contains all tracks and makes tracks from TrackModel objects.
 * 
 * @author Silas Hsu
 */
class TrackContainer extends React.Component {
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
            isMounted: false,
            xOffsets: Array(props.tracks.length).fill(0)
        };
        this.node = null;

        this.viewDrag = this.viewDrag.bind(this);
        this.viewDragEnd = this.viewDragEnd.bind(this);
        this.renderTrack = this.renderTrack.bind(this);
    }

    componentDidMount() {
        this.drawModel = new LinearDrawingModel(this.props.viewRegion, this.node.clientWidth, this.node);
        this.setState({isMounted: true});
    }

    /**
     * Called when the user drags the track around.
     * 
     * @param {any} [unused] - unused
     * @param {any} [unused2] - unused
     * @param {MouseEvent} [unusedEvent] - unused
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    viewDrag(unused, unused2, unusedEvent, coordinateDiff) {
        this.setState({xOffset: -coordinateDiff.dx});
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
        if (Math.abs(coordinateDiff.dx) > 10) {
            this.props.newRegionCallback(newStart, newEnd);
        }
    }

    /**
     * Make a single track component with the input TrackModel.
     * 
     * @param {TrackModel} trackModel - model to use to create the track
     * @param {number} key - key unique among all tracks to be mounted, as specified by React
     * @return {Track} track component to render
     */
    renderTrack(trackModel, key) {
        if (!trackModel) {
            return null;
        }

        let genericTrackProps = {
            viewRegion: this.props.viewRegion,
            xOffset: this.state.xOffset,
            metadata: trackModel,
            key: key // TODO make keys NOT index-based
        };
        switch (trackModel.getType()) {
            case BigWigTrack.TYPE_NAME.toLowerCase():
                return <BigWigTrack
                    {...genericTrackProps}
                />;
            case GeneAnnotationTrack.TYPE_NAME.toLowerCase():
                return <GeneAnnotationTrack
                    {...genericTrackProps}
                />;
            default:
                console.warn("Unknown track type " + trackModel.type);
                return null;
        }
    }

    render() {
        return (
            <div ref={node => this.node = node}>
                {this.props.tracks.map(this.renderTrack)}
                {
                this.node ?
                    <ViewDragListener
                        button={LEFT_MOUSE}
                        node={this.node}
                        drawModel={this.drawModel}
                        model={this.props.viewRegion}
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
