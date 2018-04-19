import React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/lib/connect/connect';
import { ActionCreators } from '../../AppState';

import DraggableTrackContainer from './DraggableTrackContainer';
import ReorderableTrackContainer from './ReorderableTrackContainer';
import ZoomableTrackContainer from './ZoomableTrackContainer';
import ZoomOutTrackContainer from './ZoomOutTrackContainer';
import MetadataHeader from './MetadataHeader';

import Track from '../track/Track';
import TrackLegend from '../track/commonComponents/TrackLegend';
import TrackContextMenu from '../track/contextMenu/TrackContextMenu';
import MetadataIndicator from '../track/commonComponents/MetadataIndicator';

import OutsideClickDetector from '../OutsideClickDetector';
import ContextMenuManager from '../ContextMenuManager';
import DivWithBullseye from '../DivWithBullseye';
import Reparentable from '../Reparentable';
import withAutoDimensions from '../withAutoDimensions';

import TrackModel from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

const Tools = {
    DRAG: {
        buttonContent: "✋",
        title: "Drag tool",
        cursor: "pointer",
    },
    REORDER: {
        buttonContent: "🔀",
        title: "Reorder tool",
        cursor: "all-scroll",
    },
    ZOOM_IN: {
        buttonContent: "⬚🔍+",
        title: "Zoom-in tool",
        cursor: "zoom-in",
    },
    ZOOM_OUT: {
        buttonContent: "🔍-",
        title: "Zoom-out tool",
        cursor: "zoom-out",
    }
};
const DEFAULT_CURSOR = "crosshair";

///////////////////////////
// Track selection utils //
///////////////////////////
/**
 * @param {MouseEvent} event - mouse event to inspect
 * @return {boolean} whether the input event is one that requests a selection toggle
 */
function isToggleSelect(event) {
    return event.shiftKey;
}

/**
 * Toggles the selection status of one track in an array.  Does not mutate the track; instead, the track is
 * completely replaced.
 * 
 * @param {TrackModel[]} tracks - track array to modify
 * @param {number} index - index to toggle selection status
 */
function toggleOneTrack(tracks, index) {
    tracks[index] = tracks[index].clone();
    tracks[index].isSelected = !tracks[index].isSelected;
}

/**
 * Ensures a range of tracks in the input track array has the selection status of `selectionStatus`.  An open
 * interval of indices `[startIndex, endIndex)` specifies the range.  Does not mutate any tracks; instead, tracks
 * that need modification get completely replaced.
 * 
 * @param {TrackModel[]} tracks - track array to modify
 * @param {boolean} selectionStatus - selection status of tracks to guarantee
 * @param {number} [startIndex] - inclusive index to begin modification.  Default is 0.
 * @param {number} [endIndex] - exclusive index to stop modification.  Default is the length of the array.
 */
function changeTrackSelection(tracks, selectionStatus, startIndex=0, endIndex) {
    if (!endIndex) {
        endIndex = tracks.length;
    }

    for (let i = startIndex; i < endIndex; i++) {
        const track = tracks[i];
        if (track.isSelected !== selectionStatus) {
            let clone = track.clone();
            clone.isSelected = selectionStatus;
            tracks[i] = clone;
        }
    }
}

/////////////////////////
// connect() functions //
/////////////////////////
function mapStateToProps(state) {
    return {
        viewRegion: state.viewRegion,
        tracks: state.tracks,
        metadataTerms: state.metadataTerms
    };
}

const callbacks = {
    onNewRegion: ActionCreators.setViewRegion,
    onTracksChanged: ActionCreators.setTracks,
    onMetadataTermsChanged: ActionCreators.setMetadataTerms,
};

/**
 * Container for holding all the tracks, and an avenue for manipulating state common to all tracks.
 * 
 * @author Silas Hsu
 */
class TrackContainer extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region for tracks to display
        width: PropTypes.number.isRequired, // Width of the tracks, including legends
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired, // Tracks to render
        metadataTerms: PropTypes.arrayOf(PropTypes.string).isRequired, // Metadata terms
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
        /**
         * Callback requesting a change in the metadata terms.  Signature: (newTerms: string[]): void
         */
        onMetadataTermsChanged: PropTypes.func,
    };

    static defaultProps = {
        tracks: [],
        onNewRegion: () => undefined,
        onTracksChanged: () => undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedTool: {}
        };

        this.toggleTool = this.toggleTool.bind(this);
        this.handleTrackClicked = this.handleTrackClicked.bind(this);
        this.handleMetadataClicked = this.handleMetadataClicked.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.deselectAllTracks = this.deselectAllTracks.bind(this);
    }

    /**
     * Toggles the selection of a tool, or switches tool.
     * 
     * @param {Tool} tool - tool to toggle or to switch to
     */
    toggleTool(tool) {
        if (this.state.selectedTool === tool) {
            this.setState({selectedTool: {}});
        } else {
            this.setState({selectedTool: tool});
        }
    }

    /**
     * Toggles the selection of a track, if the click event calls for it.
     * 
     * @param {MouseEvent} event - click event
     * @param {number} index - index of the track for which to toggle selection
     */
    handleTrackClicked(event, index) {
        if (isToggleSelect(event)) {
            const nextTracks = this.props.tracks.slice();
            toggleOneTrack(nextTracks, index);
            this.props.onTracksChanged(nextTracks);
        }
    }

    /**
     * When a metadata indicator is clicked, selects or deselects a range of tracks that have the same metadata.
     * 
     * @param {MouseEvent} event - click event
     * @param {string} term - the metadata term to read
     * @param {number} index - index of the track where the click event originated
     */
    handleMetadataClicked(event, term, index) {
        const tracks = this.props.tracks;
        const termValue = tracks[index].getMetadata(term);
        // Find all adjacent tracks that have the same term value.  The result interval is [minIndex, maxIndex).
        // 1.  Find matching tracks before the clicked track
        let minIndex = index - 1;
        while (minIndex >= 0 && tracks[minIndex].getMetadata(term) === termValue) {
            minIndex--;
        }
        minIndex++;

        // 2.  Find matching tracks after the clicked track
        let maxIndex = index + 1;
        while (maxIndex < tracks.length && tracks[maxIndex].getMetadata(term) === termValue) {
            maxIndex++;
        }

        // Handle track selection
        const nextTracks = tracks.slice();
        if (isToggleSelect(event)) {
            const isAlreadyAllSelected = tracks.slice(minIndex, maxIndex).every(track => track.isSelected);
            if (isAlreadyAllSelected) { // All selected?  Deselect the block.
                changeTrackSelection(nextTracks, false, minIndex, maxIndex);
            } else { // Some, or none selected?  Select the block.
                changeTrackSelection(nextTracks, true, minIndex, maxIndex);
            }
        } else { // Event not a toggle-selection one: deselect the others
            changeTrackSelection(nextTracks, false, 0, minIndex);
            changeTrackSelection(nextTracks, true, minIndex, maxIndex);
            changeTrackSelection(nextTracks, false, maxIndex);
        }
        this.props.onTracksChanged(nextTracks);
    }

    /**
     * If the clicked track is not selected, selects it and deselects all others.
     * 
     * @param {MouseEvent} event - context menu event.  Unused.
     * @param {number} index - index of the track where the context menu event originated
     */
    handleContextMenu(event, index) {
        if (!this.props.tracks[index].isSelected) {
            // If the track is not selected, select it and deselect the others.
            const nextTracks = this.props.tracks.slice();
            changeTrackSelection(nextTracks, false);
            toggleOneTrack(nextTracks, index);
            this.props.onTracksChanged(nextTracks);
        }
    }

    /**
     * Deselects all tracks.
     */
    deselectAllTracks() {
        if (this.props.tracks.some(track => track.isSelected)) {
            const nextTracks = this.props.tracks.slice();
            changeTrackSelection(nextTracks, false);
            this.props.onTracksChanged(nextTracks);
        }
    }

    // End callback methods
    ////////////////////
    // Render methods //
    ////////////////////

    /**
     * @return {JSX.Element[]} track elements to render
     */
    makeTrackElements() {
        const {viewRegion, tracks, metadataTerms} = this.props;
        return tracks.map((trackModel, index) => {
            const id = trackModel.getId();
            return <Reparentable key={id} uid={"track-" + id} >
                <Track
                    trackModel={trackModel}
                    viewRegion={viewRegion}
                    width={this.getVisualizationWidth()}
                    metadataTerms={metadataTerms}
                    index={index}
                    onContextMenu={this.handleContextMenu}
                    onClick={this.handleTrackClicked}
                    onMetadataClick={this.handleMetadataClicked}
                />
            </Reparentable>
        });
    }

    /**
     * @return {number} the width, in pixels, at which tracks should render their visualizers
     */
    getVisualizationWidth() {
        const {width, metadataTerms} = this.props;
        return Math.max(0,
            width - TrackLegend.WIDTH - metadataTerms.length * MetadataIndicator.WIDTH
        );
    }

    /**
     * @return {JSX.Element[]} buttons that select the tool to use
     */
    renderToolSelectButtons() {
        let buttons = [];
        for (let toolName in Tools) {
            const tool = Tools[toolName];
            const className = tool === this.state.selectedTool ? "btn btn-primary" : "btn btn-light";
            buttons.push(
                <button
                    key={toolName}
                    className={className}
                    title={tool.title}
                    onClick={() => this.toggleTool(tool)}
                >
                    {tool.buttonContent}
                </button>
            );
        }
        return buttons;
    }

    /**
     * Renders a subcontainer that provides specialized track manipulation, depending on the selected tool.
     * 
     * @return {JSX.Element} - subcontainer that renders tracks
     */
    renderSubContainer() {
        const {tracks, viewRegion, onNewRegion, onTracksChanged} = this.props;
        const trackElements = this.makeTrackElements();
        switch (this.state.selectedTool) {
            case Tools.REORDER:
                return <ReorderableTrackContainer
                    trackElements={trackElements}
                    trackModels={tracks}
                    onTracksChanged={onTracksChanged}
                />;
            case Tools.ZOOM_IN:
                return <ZoomableTrackContainer
                    visualizationStartX={TrackLegend.WIDTH}
                    visualizationWidth={this.getVisualizationWidth()}
                    trackElements={trackElements}
                    viewRegion={viewRegion}
                    onNewRegion={onNewRegion}
                />;
            case Tools.DRAG:
                return <DraggableTrackContainer
                    visualizationWidth={this.getVisualizationWidth()}
                    trackElements={trackElements}
                    viewRegion={viewRegion}
                    onNewRegion={onNewRegion}
                />;
            case Tools.ZOOM_OUT:
                return <ZoomOutTrackContainer
                    trackElements={trackElements}
                    viewRegion={viewRegion}
                    onNewRegion={onNewRegion}
                />;
            default:
                return trackElements;
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        const {tracks, metadataTerms, onTracksChanged, onMetadataTermsChanged} = this.props;
        const contextMenu = <TrackContextMenu allTracks={tracks} onTracksChanged={onTracksChanged} />;
        const trackDivStyle = {border: "1px solid black", cursor: this.state.selectedTool.cursor || DEFAULT_CURSOR};

        return (
        <OutsideClickDetector onOutsideClick={this.deselectAllTracks} style={{margin: 5}} >
            <div style={{display: "flex", alignItems: "flex-end"}} >
                {this.renderToolSelectButtons()}
                <MetadataHeader terms={metadataTerms} onNewTerms={onMetadataTermsChanged} />
            </div>
            <ContextMenuManager menuElement={contextMenu} >
                <DivWithBullseye style={trackDivStyle}>
                    {this.renderSubContainer()}
                </DivWithBullseye>
            </ContextMenuManager>
        </OutsideClickDetector>
        );
    }
}

export default connect(mapStateToProps, callbacks)(withAutoDimensions(TrackContainer));
