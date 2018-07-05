import React from 'react';
import PropTypes from 'prop-types';
import DragAcrossDiv from './DragAcrossDiv';
import { MouseButton, getRelativeCoordinates } from '../util';
import './SelectableArea.css';

const CANCEL_KEY = 27;

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
         * Function that is given the box's current width and should return an elemenet to display inside the box.
         *     Signature: (width: number): JSX.Element
         */
        getInnerElement: PropTypes.func,
        /**
         * Function that is given the box's current width, and returns whether the box's size is suitable for firing the
         * onAreaSelected callback.  Signature: (width: number): boolean
         */
        getIsWidthSelectable: PropTypes.func,

        /**
         * Callback when the user lets go of the mouse, selecting an area.  Signature:
         *     (startX: number, endX: number, event: React.SyntheticEvent)
         *         `startX` - the left X coordinate of the selected area
         *         `endX` - the right X coordinate of the selected area
         *         `event` - the event that triggered the selection
         */
        onAreaSelected: PropTypes.func
    };

    static defaultProps = {
        button: MouseButton.LEFT,
        y: "0px",
        height: "100%",
        getInnerElement: width => null,
        getIsWidthSelectable: width => true,
        onAreaSelected: () => undefined,
    };

    /**
     * Initializes state, binds event listeners, and attaches a keyboard listener to the window, which will listen for
     * requests to cancel a selection.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            dragStartX: 0,
            currentDragX: 0,
        };
        this.dragStart = this.dragStart.bind(this);
        this.drag = this.drag.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
        this.checkCancel = this.checkCancel.bind(this);
        window.addEventListener("keyup", this.checkCancel);
    }

    /**
     * Detaches the keyboard listener that was attached in the constructor.
     * 
     * @override
     */
    componentWillUnmount() {
        window.removeEventListener("keyup", this.checkCancel);
    }

    /**
     * Initializes the selection box.
     * 
     * @param {React.SyntheticEvent} event - the event signaling a drag start
     */
    dragStart(event) {
        event.preventDefault();
        const x = getRelativeCoordinates(event).x;
        this.setState({isDragging: true, dragStartX: x, currentDragX: x});
    }

    /**
     * Called when the mouse changes position while dragging the selection box.
     * 
     * @param {React.SyntheticEvent} event - the mouse event
     */
    drag(event) {
        const currentX = getRelativeCoordinates(event).x;
        this.setState({currentDragX: currentX});
    }

    /**
     * Called when the user lets go of the mouse after dragging the selection box.
     * 
     * @param {React.SyntheticEvent} event - the mouse event
     */
    dragEnd(event) {
        if (this.state.isDragging) {
            const startX = Math.min(this.state.dragStartX, this.state.currentDragX);
            const endX = Math.max(this.state.dragStartX, this.state.currentDragX);
            if (this.props.getIsWidthSelectable(endX - startX)) {
                this.props.onAreaSelected(startX, endX, event);
            }
            this.setState({isDragging: false});
        }
    }

    /**
     * Check if the keyboard event is one that cancels an in-progess selection.
     * 
     * @param {KeyboardEvent} event 
     */
    checkCancel(event) {
        if (event.keyCode === CANCEL_KEY) {
            this.setState({isDragging: false});
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        const {button, height, y, getInnerElement, getIsWidthSelectable, children} = this.props;
        let theBox = null;
        const width = Math.abs(this.state.dragStartX - this.state.currentDragX);
        if (this.state.isDragging) {
            const x = Math.min(this.state.dragStartX, this.state.currentDragX);
            let className = "SelectableArea-box";
            if (!getIsWidthSelectable(width)) {
                className += " SelectableArea-box-too-small";
            }
            theBox = (
                <div
                    className={className}
                    style={{
                        left: x + "px",
                        top: y,
                        width: width + "px",
                        height: height,
                    }}
                >
                    {getInnerElement(width)}
                </div>
            );
        }

        return (
        <DragAcrossDiv
            button={button}
            onDragStart={this.dragStart}
            onDrag={this.drag}
            onDragEnd={this.dragEnd}
            onKeyUp={this.checkCancel}
            style={{position: "relative"}}
        >
            {theBox}
            {children}
        </DragAcrossDiv>
        );
    }
}

export default SelectableArea;
