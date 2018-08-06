import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import connect from 'react-redux/lib/connect/connect';
import { ActionCreators } from '../../AppState';

import TrackHandle from './TrackHandle';
import DraggableTrackContainer from './DraggableTrackContainer';
import ReorderableTrackContainer from './ReorderableTrackContainer';
import ZoomableTrackContainer from './ZoomableTrackContainer';
import MetadataHeader from './MetadataHeader';
import { Tools, ToolButtons } from './Tools';

import { DEFAULT_WIDTH as LEGEND_WIDTH } from '../trackVis/commonComponents/TrackLegend';
import TrackContextMenu from '../trackContextMenu/TrackContextMenu';

import OutsideClickDetector from '../OutsideClickDetector';
import ContextMenuManager from '../ContextMenuManager';
import DivWithBullseye from '../DivWithBullseye';
import withAutoDimensions from '../withAutoDimensions';

import TrackModel from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import RegionExpander from '../../model/RegionExpander';
import TrackSelectionBehavior from '../../model/TrackSelectionBehavior';

const DEFAULT_CURSOR = "crosshair";
const REGION_EXPANDER = new RegionExpander(1);
// Simple caching for the calculateExpansion computation
REGION_EXPANDER.calculateExpansion = memoizeOne(REGION_EXPANDER.calculateExpansion);
const SELECTION_BEHAVIOR = new TrackSelectionBehavior();

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
         *         `newStart`: the nav context coordinate of the start of the new view interval
         *         `newEnd`: the nav context coordinate of the end of the new view interval
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

    static getDerivedStateFromProps(nextProps) {
        const {viewRegion, width} = nextProps;
        const visualizationWidth = Math.max(0, width - LEGEND_WIDTH);
        return {
            visualizerInfo: REGION_EXPANDER.calculateExpansion(visualizationWidth, viewRegion)
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            selectedTool: Tools.DRAG,
            visualizerInfo: {
                width: 0,
                viewRegion: null,
                viewWindow: null,
            }
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
            this.setState({selectedTool: null});
        } else {
            this.setState({selectedTool: tool});
        }
    }

    /**
     * 
     * @param {boolean[]} newSelections 
     */
    changeTrackSelection(newSelections) {
        if (!newSelections) {
            return;
        }
        const tracks = this.props.tracks;
        if (tracks.length !== newSelections.length) {
            console.error("Trying to apply new track selection status that is not the same length of existing tracks.");
            console.error(newSelections);
        }

        let wasTrackChanged = false;
        const nextTracks = tracks.map((track, i) => {
            if (track.isSelected !== newSelections[i]) {
                const clone = track.clone();
                clone.isSelected = newSelections[i];
                wasTrackChanged = true;
                return clone;
            } else {
                return track;
            }
        });

        if (wasTrackChanged) {
            this.props.onTracksChanged(nextTracks);
        }
    }

    /**
     * Handles selection behavior when a track is clicked.
     * 
     * @param {MouseEvent} event - click event
     * @param {number} index - index of the clicked track
     */
    handleTrackClicked(event, index) {
        this.changeTrackSelection(SELECTION_BEHAVIOR.handleClick(this.props.tracks, index, event));
    }

    /**
     * Handles selection behavior when a track's context menu is opened.
     * 
     * @param {MouseEvent} event - context menu event.  Unused.
     * @param {number} index - index of the track where the context menu event originated
     */
    handleContextMenu(event, index) {
        this.changeTrackSelection(SELECTION_BEHAVIOR.handleContextMenu(this.props.tracks, index));
    }

    /**
     * Handles selection behavior when a track's metadata indicator is clicked.
     * 
     * @param {MouseEvent} event - click event
     * @param {string} term - the metadata term that was clicked
     * @param {number} index - index of the clicked track
     */
    handleMetadataClicked(event, term, index) {
        this.changeTrackSelection(SELECTION_BEHAVIOR.handleMetadataClick(this.props.tracks, index, term, event));
    }

    /**
     * Requests deselection of all tracks.
     */
    deselectAllTracks() {
        this.changeTrackSelection(Array(this.props.tracks.length).fill(false));
    }

    // End callback methods
    ////////////////////
    // Render methods //
    ////////////////////
    /**
     * @return {JSX.Element}
     */
    renderControls() {
        const {metadataTerms, onMetadataTermsChanged} = this.props;
        return <div style={{display: "flex", alignItems: "flex-end"}} >
            <div>
                {/* <ZoomButtons viewRegion={viewRegion} onNewRegion={onNewRegion} /> */}
                <ToolButtons allTools={Tools} selectedTool={this.state.selectedTool} onToolClicked={this.toggleTool} />
            </div>
            <MetadataHeader terms={metadataTerms} onNewTerms={onMetadataTermsChanged} />
        </div>;
    }

    /**
     * @return {JSX.Element[]} track elements to render
     */
    makeTrackElements() {
        const {tracks, metadataTerms} = this.props;
        return tracks.map((trackModel, index) => 
            <TrackHandle
                key={trackModel.getId()}
                trackModel={trackModel}
                {...this.state.visualizerInfo}
                metadataTerms={metadataTerms}
                xOffset={0}
                index={index}
                onContextMenu={this.handleContextMenu}
                onClick={this.handleTrackClicked}
                onMetadataClick={this.handleMetadataClicked}
            />
        );
    }

    /**
     * @return {number} the width, in pixels, at which tracks should render their visualizers
     */
    getVisualizationWidth() {
        return this.state.visualizerInfo.viewWindow.getLength();
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
                    visualizationStartX={LEGEND_WIDTH}
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
            default:
                return trackElements;
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        const {tracks, onTracksChanged} = this.props;
        const selectedTool = this.state.selectedTool;
        const contextMenu = <TrackContextMenu tracks={tracks} onTracksChanged={onTracksChanged} />;
        const trackDivStyle = {border: "1px solid black", cursor: selectedTool ? selectedTool.cursor : DEFAULT_CURSOR};

        return (
        <OutsideClickDetector onOutsideClick={this.deselectAllTracks} style={{margin: 5}} >
            {this.renderControls()}
            <ContextMenuManager menuElement={contextMenu} shouldMenuClose={event => !SELECTION_BEHAVIOR.isToggleEvent(event)} >
                <DivWithBullseye style={trackDivStyle}>
                    {this.renderSubContainer()}
                </DivWithBullseye>
            </ContextMenuManager>
        </OutsideClickDetector>
        );
    }
}

export default connect(mapStateToProps, callbacks)(withAutoDimensions(TrackContainer));
