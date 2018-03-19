import React from 'react';
import PropTypes from 'prop-types';

import DraggableTrackContainer from './DraggableTrackContainer';
import ReorderableTrackContainer from './ReorderableTrackContainer';
import ZoomableTrackContainer from './ZoomableTrackContainer';

import Track from '../track/Track';
import { WIDTH as LEGEND_WIDTH } from '../track/TrackLegend';
import TrackContextMenu from '../track/contextMenu/TrackContextMenu';

import OutsideClickDetector from '../OutsideClickDetector';
import ContextMenuManager from '../ContextMenuManager';
import DivWithBullseye from '../DivWithBullseye';
import Reparentable from '../Reparentable';

import withAutoDimensions from '../withAutoDimensions';
import { MouseButtons } from '../../util';
import TrackModel from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import MetadataHeader from './MetadataHeader';

const METADATA_TERMS = ['Track type', 'Assay', 'Sample'];

const TOOLS = {
    drag: {
        buttonContent: "✋",
        title: "Drag tool"
    },
    zoom: {
        buttonContent: "🔍",
        title: "Zoom tool",
    },
    reorder: {
        buttonContent: "🔀",
        title: "Reorder tool"
    },
};

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
            selectedTool: TOOLS.drag,
            contextMenuEvent: null,
        };

        this.trackClicked = this.trackClicked.bind(this);
        this.handleContextMenuEvent = this.handleContextMenuEvent.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.selectTracksByMetadata = this.selectTracksByMetadata.bind(this);
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
            const nextTracks = this.props.tracks.slice();
            this.changeTrackSelection(nextTracks, false);
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
            const nextTracks = this.props.tracks.slice();
            this.changeTrackSelection(nextTracks, false);
            this.props.onTracksChanged(nextTracks);
        }
    }

    /**
     * 
     * @param {string} term 
     * @param {number} index 
     */
    selectTracksByMetadata(term, index) {
        const tracks = this.props.tracks;
        const termValue = tracks[index].getMetadata(term);
        let minIndex = index - 1;
        while (minIndex >= 0 && tracks[minIndex].getMetadata(term) === termValue) {
            minIndex--;
        }
        minIndex++;

        let maxIndex = index + 1;
        while (maxIndex < tracks.length && tracks[maxIndex].getMetadata(term) === termValue) {
            maxIndex++;
        }

        let nextTracks = tracks.slice();
        this.changeTrackSelection(nextTracks, false, 0, minIndex);
        this.changeTrackSelection(nextTracks, true, minIndex, maxIndex);
        this.changeTrackSelection(nextTracks, false, maxIndex);
        this.props.onTracksChanged(nextTracks);
    }

    /**
     * @return {TrackModel[]} copy of this.props.tracks where all tracks are deselected.
     */
    changeTrackSelection(tracks, newSelectionValue, startIndex=0, endIndex) {
        if (!endIndex) {
            endIndex = tracks.length;
        }

        for (let i = startIndex; i < endIndex; i++) {
            const track = tracks[i];
            if (track.isSelected !== newSelectionValue) {
                let clone = track.clone();
                clone.isSelected = newSelectionValue;
                tracks[i] = clone;
            }
        }
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
        for (let toolName in TOOLS) {
            const tool = TOOLS[toolName];
            const className = tool === this.state.selectedTool ? "btn btn-primary" : "btn btn-light";
            buttons.push(
                <button
                    key={toolName}
                    className={className}
                    title={tool.title}
                    onClick={() => this.setState({selectedTool: tool})}
                >
                    {tool.buttonContent}
                </button>
            );
        }
        return buttons;
    }

    getVisualizationWidth() {
        return Math.max(0, this.props.width - LEGEND_WIDTH);
    }

    /**
     * @return {JSX.Element[]} track elements to render
     */
    makeTrackElements() {
        return this.props.tracks.map((trackModel, index) => {
            const id = trackModel.getId();
            return <Reparentable key={id} uid={"track-" + id} >
                <Track
                    trackModel={trackModel}
                    viewRegion={this.props.viewRegion}
                    width={this.getVisualizationWidth()}
                    metadataTerms={METADATA_TERMS}
                    onContextMenu={event => this.handleContextMenuEvent(event, index)}
                    onClick={event => this.trackClicked(event, index)}
                    onMetadataClick={(event, term) => this.selectTracksByMetadata(term, index)}
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
            case TOOLS.reorder:
                return (
                    <ReorderableTrackContainer
                        trackElements={trackElements}
                        trackModels={tracks}
                        onTracksChanged={onTracksChanged}
                    />
                );
            case TOOLS.zoom:
                return (
                    <ZoomableTrackContainer
                        legendWidth={LEGEND_WIDTH}
                        trackElements={trackElements}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                    />
                );
            case TOOLS.drag:
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
            <div style={{display: "flex", alignItems: "flex-end"}} >
                {this.renderToolSelectButtons()}
                <MetadataHeader terms={METADATA_TERMS} />
            </div>
            <ContextMenuManager shouldMenuOpen={isNotControlKey} shouldMenuClose={isNotControlKey} menuElement={contextMenu} >
                <DivWithBullseye style={trackDivStyle} >
                    {this.renderSubContainer()}
                </DivWithBullseye>
            </ContextMenuManager>
        </OutsideClickDetector>
        );
    }
}

export default withAutoDimensions(TrackContainer);
