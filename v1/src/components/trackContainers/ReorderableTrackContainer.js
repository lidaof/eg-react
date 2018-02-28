import React from 'react';
import PropTypes from 'prop-types';
import GenericDraggable from '../GenericDraggable';
import GenericDroppable from '../GenericDroppable';

/**
 * Track container where the tracks can be dragged and dropped.
 * 
 * @author Silas Hsu
 */
class ReorderableTrackContainer extends React.Component {
    static propTypes = {
        trackElements: PropTypes.arrayOf(PropTypes.object).isRequired, // Track components to render

        /**
         * Callback for when tracks are reordered.  Signature:
         *     (fromIndex: number, toIndex: number): void
         *         `fromIndex`: the index of the moved track in trackElements
         *         `toIndex`: the index to which the track should move
         */
        onTrackMoved: PropTypes.func, 
    };

    static defaultProps = {
        onTrackMoved: () => undefined
    };

    constructor(props) {
        super(props);
        this.trackDropped = this.trackDropped.bind(this);
    }

    /**
     * Callback for when a user has just finished a drag-and-drop.
     * 
     * @param {DropResult} dropResult - object from react-beautiful-dnd
     */
    trackDropped(dropResult) {
        if (!dropResult.destination) {
            return;
        }
        const fromIndex = dropResult.source.index;
        const toIndex = dropResult.destination.index;
        this.props.onTrackMoved(fromIndex, toIndex);
    }

    /**
     * @inheritdoc
     */
    render() {
        // Add keys
        let modifiedTracks = this.props.trackElements.map((trackElement, index) => {
            const id = trackElement.props.trackModel ? trackElement.props.trackModel.getId() : index;
            return <GenericDraggable key={id} draggableId={id} >{trackElement}</GenericDraggable>;
        });

        return <GenericDroppable onDrop={this.trackDropped} >{modifiedTracks}</GenericDroppable>;
    }
}

export default ReorderableTrackContainer;
