import React from 'react';
import PropTypes from 'prop-types';
import GenericDraggable from '../GenericDraggable';
import GenericDroppable from '../GenericDroppable';
import TrackModel from '../../model/TrackModel';
import OpenInterval from '../../model/interval/OpenInterval';

/**
 * Track container where the tracks can be dragged and dropped.
 * 
 * @author Silas Hsu
 */
class ReorderableTrackContainer extends React.PureComponent {
    static propTypes = {
        trackElements: PropTypes.arrayOf(PropTypes.node).isRequired, // Track elements to render
        /**
         * Track models that correspond to the track elements.  Must be the same length!
         */
        trackModels: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,

        /**
         * Callback for when tracks are reordered.  Signature: (newModels: TrackModel[]): void
         */
        onTracksChanged: PropTypes.func,
    };

    static defaultProps = {
        onTracksChanged: () => undefined
    };

    constructor(props) {
        super(props);
        this.adjacencies = []; // Set in render()
        this.bundleTracksInInterval = this.bundleTracksInInterval.bind(this);
        this.tracksDropped = this.tracksDropped.bind(this);
    }

    /**
     * Gets an array of intervals describing how adjacent tracks should group into draggables.  Non-selected tracks will
     * never drag with adjacent tracks.  Any adjacent selected tracks will group together.  This method guarantees that
     * returned intervals are sorted and will never overlap.
     * 
     * @return {OpenInterval[]} - intervals describing how adjacent tracks should group into draggables
     */
    getTrackGroupings() {
        const tracks = this.props.trackModels;
        let adjacencies = [];

        let intervalStart = 0;
        while (intervalStart < tracks.length) {
            let intervalEnd = intervalStart + 1; // Start with an interval containing just one track.
            if (tracks[intervalStart].isSelected) {
                // If this track is selected, expand the interval until we find an unselected track.
                while (intervalEnd < tracks.length && tracks[intervalEnd].isSelected) {
                    intervalEnd++;
                }
            } // else {} // Unselected tracks will be forever alone 😢

            adjacencies.push(new OpenInterval(intervalStart, intervalEnd));
            intervalStart = intervalEnd;
        }
        return adjacencies;
    }

    /**
     * Takes an interval of `this.props.trackElements` and puts them in one GenericDraggable so they drag together.
     * 
     * @param {OpenInterval} interval - indices, expressed as a range, of track elements to make draggable
     * @return {JSX.Element} - draggable track element(s)
     */
    bundleTracksInInterval(interval) {
        if (interval.getLength() === 0) {
            return null;
        }
        const tracks = this.props.trackElements.slice(...interval);
        const key = tracks[0].key;
        return <GenericDraggable key={key} draggableId={key} >{tracks}</GenericDraggable>;
    }

    /**
     * Callback for when a user has just finished a drag-and-drop.  Computes a new track order and requests the change.
     * 
     * @param {DropResult} dropResult - object from react-beautiful-dnd
     */
    tracksDropped(dropResult) {
        if (!dropResult.destination) {
            return;
        }

        const {trackModels, onTracksChanged} = this.props;
        const fromIndex = dropResult.source.index;
        const toIndex = dropResult.destination.index;
        let newAdjacencies = this.adjacencies.slice();
        const [movedInterval] = newAdjacencies.splice(fromIndex, 1);
        newAdjacencies.splice(toIndex, 0, movedInterval);

        let newOrder = [];
        for (let interval of newAdjacencies) {
            for (let i = interval.start; i < interval.end; i++) {
                newOrder.push(trackModels[i]);
            }
        }
        onTracksChanged(newOrder);
    }

    /**
     * @inheritdoc
     */
    render() {
        this.adjacencies = this.getTrackGroupings();
        const tracks = this.adjacencies.map(this.bundleTracksInInterval);
        return <GenericDroppable onDrop={this.tracksDropped} >{tracks}</GenericDroppable>;
    }
}

export default ReorderableTrackContainer;
