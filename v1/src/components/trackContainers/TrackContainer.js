import React from 'react';
import PropTypes from 'prop-types';

import DraggableTrackContainer from './DraggableTrackContainer';
import ReorderableTrackContainer from './ReorderableTrackContainer';
import ZoomableTrackContainer from './ZoomableTrackContainer';

import { Track } from '../track/Track';
import TrackLegend from '../track/TrackLegend';
import TrackContextMenu from '../track/contextMenu/TrackContextMenu';

import OutsideClickDetector from '../OutsideClickDetector';
import ContextMenuManager from '../ContextMenuManager';
import DivWithBullseye from '../DivWithBullseye';
import Reparentable from '../Reparentable';

import withAutoWidth from '../withAutoWidth';
import { MouseButtons } from '../../util';
import TrackModel from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

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
 * @param {MouseEvent} event - mouse event to inspect
 * @return {boolean} true if the control key was NOT pressed during the event
 */
function isNotControlKey(event) {
    return !event.ctrlKey;
}

/**
 * Container for holding all the tracks, and an avenue for manipulating state common to all tracks.
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

        this.trackClicked = this.trackClicked.bind(this);
        this.handleContextMenuEvent = this.handleContextMenuEvent.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    /**
     * If the control key is held, toggles the selection of a track.
     * 
     * @param {MouseEvent} event - click event
     * @param {number} index - index of the track for which to toggle selection
     */
    trackClicked(event, index) {
        if (event.button === MouseButtons.LEFT && event.ctrlKey) {
            const nextTracks = this.props.tracks.slice();
            this.toggleOneTrack(nextTracks, index);
            this.props.onTracksChanged(nextTracks);
        }
    }

    /**
     * Sets state to render a track context menu, and selects the track that was clicked if it was not already selected.
     * 
     * @param {MouseEvent} event - context menu mouse event
     * @param {number} index - index of the track where the click event originated
     */
    handleContextMenuEvent(event, index) {
        if (event.ctrlKey) {
            // On Chrome and possibly other web browsers, ctrl-clicking is actually a context menu event.
            event.preventDefault();
            event.stopPropagation();
            this.trackClicked(event, index);
        } else if (!this.props.tracks[index].isSelected) {
            // If the track is not selected, select it and deselect the others.
            const nextTracks = this.deselectAllTracks();
            this.toggleOneTrack(nextTracks, index);
            this.props.onTracksChanged(nextTracks);
        }
    }

    /**
     * Deselects all tracks on outside clicks.
     * 
     * @param {MouseEvent} event - click event to evaluate
     */
    handleOutsideClick(event) {
        if (this.props.tracks.some(track => track.isSelected)) {
            this.props.onTracksChanged(this.deselectAllTracks())
        }
    }

    /**
     * @return {TrackModel[]} copy of this.props.tracks where all tracks are deselected.
     */
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

    /**
     * Copies and mutates an element of `tracks` so its selection is toggled.
     * 
     * @param {TrackModel[]} tracks - array of TrackModel to modify
     * @param {number} index - index of track to clone and mutate
     */
    toggleOneTrack(tracks, index) {
        tracks[index] = tracks[index].clone();
        tracks[index].isSelected = !tracks[index].isSelected;
    }

    // End callback methods
    ////////////////////
    // Render methods //
    ////////////////////

    /**
     * @return {JSX.Element[]} buttons that select the tool to use
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
        return this.props.tracks.map((trackModel, index) => {
            const id = trackModel.getId();
            return <Reparentable key={id} uid={"track-" + id} >
                <Track
                    key={trackModel.getId()}
                    trackModel={trackModel}
                    viewRegion={this.props.viewRegion}
                    width={this.getVisualizationWidth()}
                    onContextMenu={event => this.handleContextMenuEvent(event, index)}
                    onClick={event => this.trackClicked(event, index)}
                />
            </Reparentable>
        });
    }

    /**
     * Renders a subtype of TrackContainer that provides specialized track manipulation, depending on the selected tool.
     * 
     * @return {JSX.Element} - subcontainer that renders tracks
     */
    renderSubContainer() {
        const {tracks, viewRegion, onNewRegion, onTracksChanged} = this.props;
        const trackElements = this.makeTrackElements();
        switch (this.state.selectedTool) {
            case tools.REORDER:
                return (
                    <ReorderableTrackContainer
                        trackElements={trackElements}
                        trackModels={tracks}
                        onTracksChanged={onTracksChanged}
                    />
                );
            case tools.ZOOM:
                return (
                    <ZoomableTrackContainer
                        legendWidth={TrackLegend.WIDTH}
                        trackElements={trackElements}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                    />
                );
            case tools.DRAG:
            default:
                return (
                    <DraggableTrackContainer
                        visualizationWidth={this.getVisualizationWidth()}
                        trackElements={trackElements}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                    />
                );
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        const {tracks, onTracksChanged} = this.props;
        const contextMenu = <TrackContextMenu allTracks={tracks} onTracksChanged={onTracksChanged} />;

        // paddingTop to counteract track's marginTop of -1
        const trackDivStyle = {border: "1px solid black", paddingTop: 1, cursor: "crosshair"};
        return (
        <OutsideClickDetector onOutsideClick={this.handleOutsideClick} style={{margin: 5}} >
            {this.renderToolSelectButtons()}
            <ContextMenuManager shouldMenuOpen={isNotControlKey} shouldMenuClose={isNotControlKey} menuElement={contextMenu} >
                <DivWithBullseye style={trackDivStyle} >
                    {this.renderSubContainer()}
                </DivWithBullseye>
            </ContextMenuManager>
        </OutsideClickDetector>
        );
    }
}

export default withAutoWidth(TrackContainer);
