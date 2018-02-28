import React from 'react';
import PropTypes from 'prop-types';
import DragAcrossDiv from './DragAcrossDiv';
import { MouseButtons, getRelativeCoordinates } from '../util';

/**
 * Creates and manages the boxes that the user can drag across the screen to select a new region.
 * 
 * @author Silas Hsu
 */
class SelectableArea extends React.Component {
    static propTypes = {
        button: PropTypes.number, // The button that must be pressed during dragging.  See DragAcrossDiv for options.
        y: PropTypes.string, // The y coordinate of the selection box; how far from the top of this container
        height: PropTypes.string, // The height of the selection box
        
        /**
         * Callback for when an area is selected.  Signature:
         *     (startX: number, endX: number, event: React.SyntheticEvent)
         *         `startX` - the left X coordinate of the selected area
         *         `endX` - the right X coordinate of the selected area
         *         `event` - the final mouse event that triggered the selection
         */
        onAreaSelected: PropTypes.func
    };

    static defaultProps = {
        button: MouseButtons.LEFT,
        y: "0px",
        height: "100%",
        onAreaSelected: () => undefined
    };

    constructor(props) {
        super(props);
        this.state = {
            dragStartX: 0,
            currentDragX: 0,
        };
        this.dragStart = this.dragStart.bind(this);
        this.drag = this.drag.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
    }

    /**
     * Initializes the selection box.
     * 
     * @param {React.SyntheticEvent} event - the event signaling a drag start
     */
    dragStart(event) {
        event.preventDefault();
        const x = getRelativeCoordinates(event).x;
        this.setState({dragStartX: x, currentDragX: x});
    }

    /**
     * Called when the mouse changes position while dragging the selection box.
     * 
     * @param {React.SyntheticEvent} event - the mouse event
     */
    drag(event) {
        this.setState({currentDragX: getRelativeCoordinates(event).x});
    }

    /**
     * Called when the user lets go of the mouse after dragging the selection box.
     * 
     * @param {React.SyntheticEvent} event - the mouse event
     */
    dragEnd(event) {
        const startX = Math.min(this.state.dragStartX, this.state.currentDragX);
        const endX = Math.max(this.state.dragStartX, this.state.currentDragX);
        this.props.onAreaSelected(startX, endX, event);
        this.setState({dragStartX: 0, currentDragX: 0});
    }

    /**
     * @inheritdoc
     */
    render() {
        let theBox = null;
        const width = Math.abs(this.state.dragStartX - this.state.currentDragX);
        if (width > 0) {
            const x = Math.min(this.state.dragStartX, this.state.currentDragX);
            theBox = <div style={{
                position: "absolute",
                left: x + "px",
                top: this.props.y,
                width: width + "px",
                height: this.props.height,
                border: "1px solid blue",
                backgroundColor: "rgba(0, 0, 153, 0.1)",
                zIndex: 1,
                pointerEvents: "none"
            }}/>
        }

        return (
        <DragAcrossDiv
            button={this.props.button}
            onDragStart={this.dragStart}
            onDrag={this.drag}
            onDragEnd={this.dragEnd}
            style={{position: "relative"}}
        >
            {theBox}
            {this.props.children}
        </DragAcrossDiv>
        );
    }
}

export default SelectableArea;
