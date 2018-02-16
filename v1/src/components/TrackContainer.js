import React from 'react';
import PropTypes from 'prop-types';

import { Track } from './track/Track';
import TrackLegend from './track/TrackLegend';

import DraggableTrackContainer from './DraggableTrackContainer';
import ReorderableTrackContainer from './ReorderableTrackContainer';
import ZoomableTrackContainer from './ZoomableTrackContainer';

import withAutoWidth from './withAutoWidth';
import { getRelativeCoordinates } from '../util';
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
            mouseRelativeX: -1,
            contextMenuEvent: null,
        };

        this.requestTrackReorder = this.requestTrackReorder.bind(this);
        this.storeMouseX = this.storeMouseX.bind(this);
        this.clearMouseX = this.clearMouseX.bind(this);
        this.openContextMenu = this.openContextMenu.bind(this);
        this.closeContextMenu = this.closeContextMenu.bind(this);
    }

    getVisualizationWidth() {
        return Math.max(0, this.props.width - TrackLegend.WIDTH);
    }

    /**
     * @return {Track[]} track components to render
     */
    makeTracks() {
        return this.props.tracks.map((trackModel, index) => (
            <Track
                trackModel={trackModel}
                viewRegion={this.props.viewRegion}
                width={this.getVisualizationWidth()}
                onContextMenu={(event) => this.openContextMenu(event, index)}
            />
        ));
    }

    /**
     * Makes the buttons that select the tool to use
     * 
     * @return {React.Component[]} buttons to render
     */
    makeToolSelectButtons() {
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

    /**
     * Stores a mouse event's relative x coordinates in state.
     * 
     * @param {MouseEvent} event - mouse event whose coordinates to store
     */
    storeMouseX(event) {
        const relativeX = getRelativeCoordinates(event).x;
        this.setState({mouseRelativeX: relativeX});
    }

    /**
     * Clears stored mouse event coordinates.
     */
    clearMouseX() {
        this.setState({mouseRelativeX: -1});
    }

    openContextMenu(event, index) {
        event.preventDefault();
        event.persist();

        const nextTracks = this.props.tracks.map(track => track.clone());
        for (let track of nextTracks) {
            track.isSelected = false;
        }
        nextTracks[index].isSelected = true;
        this.props.onTracksChanged(nextTracks);

        this.setState({contextMenuEvent: event});
    }

    closeContextMenu() {
        this.setState({contextMenuEvent: null});
    }

    /**
     * @inheritdoc
     */
    render() {
        const {viewRegion, onNewRegion, onTracksChanged} = this.props;
        const {mouseRelativeX, contextMenuEvent} = this.state;
        const trackComponents = this.makeTracks();
        let subContainer;
        switch (this.state.selectedTool) {
            case tools.REORDER:
                subContainer = (
                    <ReorderableTrackContainer
                        trackComponents={trackComponents}
                        onTrackMoved={this.requestTrackReorder}
                    />
                );
                break;
            case tools.ZOOM:
                subContainer = (
                    <ZoomableTrackContainer
                        legendWidth={TrackLegend.WIDTH}
                        trackComponents={trackComponents}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                    />
                );
                break;
            case tools.DRAG:
            default:
                subContainer = (
                    <DraggableTrackContainer
                        visualizationWidth={this.getVisualizationWidth()}
                        trackComponents={trackComponents}
                        viewRegion={viewRegion}
                        onNewRegion={onNewRegion}
                    />
                );
        }

        // paddingTop to counteract track's marginTop of -1
        const innerDivStyle = {border: "1px solid black", paddingTop: 1, position: "relative", cursor: "crosshair"};
        return (
        <div>
            {this.makeToolSelectButtons()}
            <div style={innerDivStyle} onMouseMove={this.storeMouseX} onMouseLeave={this.clearMouseX} >
                {subContainer}
                <VerticalLine x={mouseRelativeX} />
            </div>
            {
            contextMenuEvent ? 
                <ContextMenu
                    x={contextMenuEvent.pageX}
                    y={contextMenuEvent.pageY}
                    allTracks={this.props.tracks}
                    onTracksChanged={onTracksChanged}
                    onClose={this.closeContextMenu}
                />
                :
                null
            }
        </div>
        );
    }
}

/**
 * Renders a vertical line at an x coordinate.
 * 
 * @param {Object} props - props as specified by react.  The only used prop is `x`. 
 */
function VerticalLine(props) {
    if (props.x >= 0) {
        const style = {
            position: "absolute",
            top: 0,
            left: props.x - 1,
            height: "100%",
            borderLeft: "1px dotted grey",
            pointerEvents: "none"
        };
        return <div width={1} style={style} />;
    } else {
        return null;
    }
}

export default withAutoWidth(TrackContainer);
