import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

/**
 * The most basic Droppable that works with react-beautiful-dnd.  Simply add child Draggables and you're good to go!
 * 
 * Unsupported features:
 *     - Dragging things between different GenericDroppables
 *     - Nesting GenericDroppables
 * 
 * @author Silas Hsu
 */
class GenericDroppable extends React.PureComponent {
    static propTypes = {
        /**
         * Called when a user drags a child Draggable.  react-beautiful-dnd recommends that child Draggables stop
         * updating during a drag, and this function facilitates that.  See
         * https://github.com/atlassian/react-beautiful-dnd#ondragstart-optional for more info.
         * 
         * Signature: (dragInfo: DragStart): void
         */
        onDragStart: PropTypes.func,

        /**
         * Called when a Draggable is dropped inside this container. See
         * https://github.com/atlassian/react-beautiful-dnd#ondragend-required for more info.
         * 
         * Signature: (dropResult: DropResult): void
         */
        onDrop: PropTypes.func.isRequired,
    }

    /**
     * Creates a new instance, and generates a unique ID for the associated DragDropContext
     * @param {object} props - props as specified by react
     */
    constructor(props) {
        super(props);
        this.dropId = _.uniqueId();
    }

    /**
     * Renders any children inside a DragDropContext and Droppable.
     * 
     * @return {JSX.ELement} the component to render
     * @override
     */
    render() {
        return (
        <DragDropContext onDragStart={this.props.onDragStart} onDragEnd={this.props.onDrop}>
            <Droppable droppableId={this.dropId}>
                {(provided, snapshot) => (
                    <div ref={provided.innerRef}>
                        {this.props.children}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
        );
    }
}

export default GenericDroppable;
