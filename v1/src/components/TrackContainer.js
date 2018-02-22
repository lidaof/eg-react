import React from 'react';
import PropTypes from 'prop-types';

import { Track } from './track/Track';
import TrackLegend from './track/TrackLegend';

import DraggableTrackContainer from './DraggableTrackContainer';
import ReorderableTrackContainer from './ReorderableTrackContainer';
import ZoomableTrackContainer from './ZoomableTrackContainer';
import DivWithBullseye from './DivWithBullseye';

import withAutoWidth from './withAutoWidth';
import { MouseButtons } from '../util';
import TrackModel from '../model/TrackModel';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import ContextMenu from './track/contextMenu/ContextMenu';

const tools = {
    DRAG: 0,
    ZOOM: 1,
    REORDER: 2,
};

let toolButtonContent = {};
toolButtonContent[tools.DRAG] = "✋";
toolButtonContent[tools.ZOOM] = "🔍";
toolButtonContent[tools.REORDER] = "🔀";

/**
 * Container for holding all the tracks.
 * 
 * @author Silas Hsu
 */
class TrackContainer extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region for tracks to display
        width: PropTypes.number.isRequired, // Width of the tracks, including legends
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)), // Tracks to render
        /**
         * Callback for when a new region is selected.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the new view interval
         *         `newEnd`: the absolute base number of the end of the new view interval
         */
        onNewRegion: PropTypes.func,

        /**
         * Callback requesting a change in the track models.  Signature: (newModels: TrackModel[]): void
         */
        onTracksChanged: PropTypes.func,
    };

    static defaultProps = {
        tracks: [],
        onNewRegion: () => undefined,
        onTracksChanged: () => undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedTool: tools.DRAG,
            contextMenuEvent: null,
        };

        this.trackDiv = null;
        this.requestTrackReorder = this.requestTrackReorder.bind(this);
        this.trackClicked = this.trackClicked.bind(this);
        this.openContextMenu = this.openContextMenu.bind(this);
        this.closeContextMenu = this.closeContextMenu.bind(this);
    }

    /**
     * Requests a change in a track's position
     * 
     * @param {number} fromIndex - index of the track to move
     * @param {number} toIndex - index to move the track to
     */
    requestTrackReorder(fromIndex, toIndex) {
        let newOrder = this.props.tracks.slice();
        const [moved] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, moved);
        this.props.onTracksChanged(newOrder);
    }

    trackClicked(event, index) {
        if (event.button === MouseButtons.LEFT && event.ctrlKey) { // Toggle selection of one track
            const nextTracks = this.props.tracks.slice();
            this.toggleOneTrack(nextTracks, index);
            this.props.onTracksChanged(nextTracks);
        }
    }

    openContextMenu(event, index) {
        event.preventDefault();
        if (event.button === MouseButtons.LEFT) {
            this.trackClicked(event, index);
            return;
        } else if (event.ctrlKey) {
            return;
        }

        event.persist();
        this.setState({contextMenuEvent: event});
        // If the track is not selected, select it and deselect the others.
        if (!this.props.tracks[index].isSelected) {
            const nextTracks = this.deselectAllTracks();
            this.toggleOneTrack(nextTracks, index);
            this.props.onTracksChanged(nextTracks);
        }
    }

    closeContextMenu(event) {
        if (this.trackDiv.contains(event.target) && event.ctrlKey) { // Click inside the track div and ctrl held
            // Assume user is selecting multiple tracks; don't close.
            return;
        }

        this.setState({contextMenuEvent: null});
        if (!this.trackDiv.contains(event.target)) { // Click outside the track div
            this.props.onTracksChanged(this.deselectAllTracks());
        }
    }

    deselectAllTracks() {
        return this.props.tracks.map(track => {
            if (track.isSelected) {
                let clone = track.clone();
                clone.isSelected = false;
                return clone;
            } else {
                return track;
            }
        });
    }

    toggleOneTrack(tracks, index) {
        tracks[index] = tracks[index].clone();
        tracks[index].isSelected = !tracks[index].isSelected;
    }

    /**
     * Makes the buttons that select the tool to use
     * 
     * @return {JSX.Element[]} buttons to render
     */
    renderToolSelectButtons() {
        let buttons = [];
        for (let toolName in tools) {
            const tool = tools[toolName];
            const className = tool === this.state.selectedTool ? "btn btn-primary" : "btn btn-light";
            buttons.push(
                <button
                    key={tool}
                    className={className}
                    onClick={() => this.setState({selectedTool: tool})}
                >
                    {toolButtonContent[tool]}
                </button>
            );
        }
        return buttons;
    }

    getVisualizationWidth() {
        return Math.max(0, this.props.width - TrackLegend.WIDTH);
    }

    /**
     * @return {JSX.Element[]} track elements to render
     */
    makeTrackElements() {
        return this.props.tracks.map((trackModel, index) => (
            <Track
                trackModel={trackModel}
                viewRegion={this.props.viewRegion}
                width={this.getVisualizationWidth()}
                onContextMenu={event => this.openContextMenu(event, index)}
                onClick={event => this.trackClicked(event, index)}
            />
        ));
    }

    renderSubContainer() {
        const {viewRegion, onNewRegion} = this.props;
        const trackElements = this.makeTrackElements();
        switch (this.state.selectedTool) {
            case tools.REORDER:
                return (
                    <ReorderableTrackContainer
                        trackComponents={trackElements}
                        onTrackMoved={this.requestTrackReorder}
                    />
                );
            case tools.ZOOM:
                return (
                    <ZoomableTrackContainer
                        legendWidth={TrackLegend.WIDTH}
                        trackComponents={trackElements}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                    />
                );
            case tools.DRAG:
            default:
                return (
                    <DraggableTrackContainer
                        visualizationWidth={this.getVisualizationWidth()}
                        trackComponents={trackElements}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                    />
                );
        }
    }

    renderContextMenu() {
        const {tracks, onTracksChanged} = this.props;
        const contextMenuEvent = this.state.contextMenuEvent;
        if (contextMenuEvent) {
            return (
                <ContextMenu
                    x={contextMenuEvent.pageX}
                    y={contextMenuEvent.pageY}
                    allTracks={tracks}
                    onTracksChanged={onTracksChanged}
                    onClose={this.closeContextMenu}
                />
            );
        } else {
            return null;
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        // paddingTop to counteract track's marginTop of -1
        const trackDivStyle = {border: "1px solid black", paddingTop: 1, cursor: "crosshair"};
        return (
        <div>
            {this.renderToolSelectButtons()}
            <DivWithBullseye innerRef={node => this.trackDiv = node} style={trackDivStyle} >
                {this.renderSubContainer()}
            </DivWithBullseye>
            {this.renderContextMenu()}
        </div>
        );
    }
}

export default withAutoWidth(TrackContainer);
