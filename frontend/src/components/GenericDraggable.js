import React from "react";
import PropTypes from "prop-types";
import { Draggable } from "react-beautiful-dnd";

/**
 * The most basic Draggable that works with react-beautiful-dnd.  Add as a child to any Droppable.
 *
 * @author Silas Hsu
 */
class GenericDraggable extends React.PureComponent {
    static propTypes = {
        /**
         * An ID unique to the parent DragDropContext.  Do not change this once it is set.
         */
        draggableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        isDragDisabled: PropTypes.bool, // Whether to disable dragging.  Default is false.
        index: PropTypes.number,
    };

    /**
     * @inheritdoc
     */
    render() {
        const { draggableId, isDragDisabled, index, children } = this.props;
        return (
            <Draggable key={draggableId} draggableId={draggableId} index={index} isDragDisabled={isDragDisabled}>
                {(provided, snapshot) => (
                    <div>
                        <div
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                        >
                            {children}
                        </div>
                        {provided.placeholder}
                    </div>
                )}
            </Draggable>
        );
    }
}

export default GenericDraggable;
