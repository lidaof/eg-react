import React from 'react';
import { DragAcrossDiv } from './DragAcrossDiv';
import OpenInterval from '../model/interval/OpenInterval';
import { MouseButton, getRelativeCoordinates } from '../util';

import './SelectableArea.css';

const CANCEL_KEY = 27; // Escape

interface SelectableAreaProps {
    mouseButton?: MouseButton; // Mouse button used for drag-selecting
    y?: number | string; // Relative Y of the top of the selection box; how far from the top of this container
    height?: number | string; // Height of the selection box
    dragLimits?: OpenInterval; // Drawing limits of the selection box

    /**
     * Callback for getting an element to display inside the box, if desired.
     * 
     * @param {OpenInterval} xSpan - the current x span of the selection box
     * @return {JSX.Element} element to display inside the selection box
     */
    getInnerElement?(xSpan: OpenInterval): JSX.Element;

    /**
     * Callback for whether the selectable area is a valid area.  If not, the component should display feedback.
     * 
     * @param {OpenInterval} xSpan - the current x span of the selection box
     * @return {boolean} whether the current area is selectable
     */
    getIsAreaValid?(xSpan: OpenInterval): boolean;

    /**
     * Callback when the user lets go of the mouse, selecting the area.  Does not fire if getIsAreaSelectable returns
     * false.
     * 
     * @param {OpenInterval} xSpan - the x span of the selected area
     */
    onAreaSelected?(xSpan: OpenInterval): void;
}

interface SelectableAreaState {
    isDragging: boolean;
    dragStartX: number;
    currentDragX: number;
}

/**
 * Creates and manages the boxes that the user can drag across the screen to select a new region.
 * 
 * @author Silas Hsu
 */
export class SelectableArea extends React.PureComponent<SelectableAreaProps, SelectableAreaState> {
    static defaultProps: SelectableAreaProps = {
        mouseButton: MouseButton.LEFT,
        y: "0px",
        height: "100%",
        dragLimits: new OpenInterval(-Infinity, Infinity),
        getInnerElement: () => null,
        getIsAreaValid: () => true,
        onAreaSelected: () => undefined,
    };

    /**
     * Initializes state, binds event listeners, and attaches a keyboard listener to the window, which will listen for
     * requests to cancel a selection.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props: SelectableAreaProps) {
        super(props);
        this.state = {
            isDragging: false,
            dragStartX: 0,
            currentDragX: 0,
        };
        this.dragStart = this.dragStart.bind(this);
        this.drag = this.drag.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    /**
     * Detaches the keyboard listener that was attached in the constructor.
     * 
     * @override
     */
    componentWillUnmount() {
        window.removeEventListener("keyup", this.handleKeyUp);
    }

    /**
     * @param {number} x - x relative to the left side of the container
     * @return {boolean} whether selection is allowed at the x coordinate
     */
    isInDragLimits(x: number): boolean {
        return this.props.dragLimits.start < x && x < this.props.dragLimits.end;
    }

    /**
     * @return {OpenInterval} the currently selected span of x coordinates
     */
    getSelectedSpan(): OpenInterval {
        return new OpenInterval(
            Math.min(this.state.dragStartX, this.state.currentDragX),
            Math.max(this.state.dragStartX, this.state.currentDragX)
        );
    }

    /**
     * Initializes the selection box.
     * 
     * @param {React.MouseEvent} event - the event signaling a drag start
     */
    dragStart(event: React.MouseEvent) {
        event.preventDefault();
        const x = getRelativeCoordinates(event).x;
        if (this.isInDragLimits(x)) {
            this.setState({isDragging: true, dragStartX: x, currentDragX: x});
        }
    }

    /**
     * Called when the mouse changes position while dragging the selection box.
     * 
     * @param {React.MouseEvent} event - the mouse event
     */
    drag(event: React.MouseEvent) {
        const x = getRelativeCoordinates(event).x;
        if (this.isInDragLimits(x)) {
            this.setState({currentDragX: x});
        }
    }

    /**
     * Called when the user lets go of the mouse after dragging the selection box.
     */
    dragEnd() {
        if (this.state.isDragging) {
            const selectedSpan = this.getSelectedSpan();
            if (this.props.getIsAreaValid(selectedSpan)) {
                this.props.onAreaSelected(selectedSpan);
            }
            this.setState({isDragging: false});
        }
    }

    /**
     * Check if the keyboard event is one that cancels an in-progess selection.
     * 
     * @param {KeyboardEvent} event 
     */
    handleKeyUp(event: KeyboardEvent) {
        if (event.keyCode === CANCEL_KEY) {
            this.setState({isDragging: false});
        }
    }

    /**
     * @inheritdoc
     */
    render(): JSX.Element {
        const {mouseButton, height, y, getInnerElement, getIsAreaValid, children} = this.props;
        let theBox = null;
        if (this.state.isDragging) {
            const selectedSpan = this.getSelectedSpan();
            let className = "SelectableArea-box";
            if (!getIsAreaValid(selectedSpan)) {
                className += " SelectableArea-box-invalid";
            }
            const style = {
                left: selectedSpan.start + "px",
                top: y,
                width: selectedSpan.getLength() + "px",
                height
            };

            theBox = <div className={className} style={style} >{getInnerElement(selectedSpan)}</div>;
        }

        return (
        <DragAcrossDiv
            mouseButton={mouseButton}
            onDragStart={this.dragStart}
            onDrag={this.drag}
            onDragEnd={this.dragEnd}
            style={{position: "relative"}}
        >
            {theBox}
            {children}
        </DragAcrossDiv>
        );
    }
}
