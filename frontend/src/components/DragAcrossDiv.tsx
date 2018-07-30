import React from 'react';
import { MouseButton } from '../util';

export interface CoordinateDiff {
    dx: number;
    dy: number;
}

interface DragAcrossDivProps {
    mouseButton: MouseButton; // The mouse button to respond to
    style?: object; // Any style desired

    /**
     * Callback for when dragging starts.
     * 
     * @param {React.MouseEvent} event - the event that triggered this callback
     */
    onDragStart?(event: React.MouseEvent): void;

    /**
     * Callback for each little bit of movement during a drag.
     * 
     * @param {React.MouseEvent} event - the event that triggered this callback
     * @param {CoordinateDiff} coordinateDiff - how far the mouse has moved since the drag started
     */
    onDrag?(event: React.MouseEvent, coordinateDiff: CoordinateDiff): void;

    /**
     * Callback for when the user lets go of the mouse and stops dragging.
     * 
     * @param {React.MouseEvent} event - the event that triggered this callback
     * @param {CoordinateDiff} coordinateDiff - how far the mouse has moved since the drag started
     */
    onDragEnd?(event: React.MouseEvent, coordinateDiff: CoordinateDiff): void;
}

function doNothing() {}

/**
 * A <div> that listens for drag-across events, where a user drags the cursor inside the div.  The drag callbacks will
 * fire even for short clicks; be sure to take this possibility into account when working with this component!
 * 
 * @author Silas Hsu
 */
export class DragAcrossDiv extends React.Component<DragAcrossDivProps> {
    static defaultProps = {
        onDragStart: doNothing,
        onDrag: doNothing,
        onDragEnd: doNothing
    };

    private originEvent: React.MouseEvent;

    constructor(props: DragAcrossDivProps) {
        super(props);
        this.originEvent = null;
        this.mousedown = this.mousedown.bind(this);
        this.mousemove = this.mousemove.bind(this);
        this.mouseup = this.mouseup.bind(this);
    }

    /**
     * Callback for mousedown events on the <div>.
     * 
     * @param {React.MouseEvent} event - mouse event that triggered this callback
     */
    mousedown(event: React.MouseEvent) {
        if (this.originEvent === null && event.button === this.props.mouseButton) {
            event.persist();
            this.originEvent = event;
            this.props.onDragStart(event);
        }
    }

    /**
     * Callback for mousemove events on the <div>.
     * 
     * @param {React.MouseEvent} event - mouse event that triggered this callback
     */
    mousemove(event: React.MouseEvent) {
        if (this.originEvent !== null) {
            const diff = {
                dx: event.clientX - this.originEvent.clientX,
                dy: event.clientY - this.originEvent.clientY,
            };
            this.props.onDrag(event, diff);
        }
    }

    /**
     * Callback for mouseup events on the <div>.
     * 
     * @param {React.MouseEvent} event - mouse event that triggered this callback
     */
    mouseup(event: React.MouseEvent) {
        if (this.originEvent !== null) {
            const diff = {
                dx: event.clientX - this.originEvent.clientX,
                dy: event.clientY - this.originEvent.clientY,
            };
            this.props.onDragEnd(event, diff);
            this.originEvent = null;
        }
    }

    /**
     * @return {JSX.Element} a div that listens to drag events
     * @override
     */
    render() {
        const {
            mouseButton,
            onDragStart,
            onDrag,
            onDragEnd,
            children,
            ...remainingProps
        } = this.props;

        return (
        <div
            onMouseDown={this.mousedown}
            onMouseMove={this.mousemove}
            onMouseUp={this.mouseup}
            {...remainingProps}
        >
            {children}
        </div>
        );
    }
}
