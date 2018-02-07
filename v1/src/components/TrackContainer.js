import React from 'react';
import PropTypes from 'prop-types';

import DraggableTrackContainer from './DraggableTrackContainer';

import { Track } from './track/Track';
import TrackLegend from './track/TrackLegend';
import TrackModel from '../model/TrackModel';
import ReorderableTrackContainer from './ReorderableTrackContainer';
import ZoomableTrackContainer from './ZoomableTrackContainer';
import withAutoWidth from './withAutoWidth';

const tools = {
    DRAG: 0,
    ZOOM: 1,
    REORDER: 2,
};

let toolButtonContent = {};
toolButtonContent[tools.DRAG] = "✋";
toolButtonContent[tools.ZOOM] = "🔍";
toolButtonContent[tools.REORDER] = "🔀";

const VIEW_EXPANSION_VALUE = 1;

/**
 * Container for holding all the tracks.
 * 
 * @author Silas Hsu
 */
class TrackContainer extends React.Component {
    static propTypes = {
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
        };
        this.trackMoved = this.trackMoved.bind(this);
    }

    getVisualizationWidth() {
        return Math.max(0, this.props.width - TrackLegend.WIDTH);
    }

    /**
     * @return {Track[]} track components to render
     */
    makeTracks() {
        return this.props.tracks.map(trackModel => (
            <Track
                trackModel={trackModel}
                viewRegion={this.props.viewRegion}
                viewExpansionValue={VIEW_EXPANSION_VALUE}
                width={this.getVisualizationWidth()}
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
    trackMoved(fromIndex, toIndex) {
        let newOrder = this.props.tracks.slice();
        const [moved] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, moved);
        this.props.onTracksChanged(newOrder);
    }

    /**
     * @inheritdoc
     */
    render() {
        let subContainer;
        let tracks = this.makeTracks();
        switch (this.state.selectedTool) {
            case tools.REORDER:
                subContainer = (
                    <ReorderableTrackContainer trackComponents={tracks} onTrackMoved={this.trackMoved} />
                );
                break;
            case tools.ZOOM:
                subContainer = (
                    <ZoomableTrackContainer
                        legendWidth={TrackLegend.WIDTH}
                        trackComponents={tracks}
                        viewRegion={this.props.viewRegion}
                        onNewRegion={this.props.onNewRegion}
                    />
                );
                break;
            case tools.DRAG:
            default:
                subContainer = (
                    <DraggableTrackContainer
                        visualizationWidth={this.getVisualizationWidth()}
                        trackComponents={tracks}
                        viewRegion={this.props.viewRegion}
                        onNewRegion={this.props.onNewRegion}
                    />
                );
        }

        return (
        <div>
            {this.makeToolSelectButtons()}
            {/* paddingTop to counteract track's marginTop of -1*/}
            <div style={{border: "1px solid black", paddingTop: 1}} >
                {subContainer}
            </div>
        </div>
        );
    }
}

export default withAutoWidth(TrackContainer);
