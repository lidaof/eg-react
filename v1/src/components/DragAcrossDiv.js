import PropTypes from 'prop-types';
import React from 'react';

export const LEFT_MOUSE = 0;
export const MIDDLE_MOUSE = 1;
export const RIGHT_MOUSE = 2;

/**
 * A <div> that listens for drag-across events, where a user drags the cursor across the div.
 * 
 * @author Silas Hsu
 */
export class DragAcrossDiv extends React.Component {
    static propTypes = {
        button: PropTypes.number.isRequired, // The mouse button to listen to.  See the consts defined above this class.

        /**
         * Called when dragging starts.  Signature: (event: React.SyntheticEvent): void
         */

        onDragStart: PropTypes.func,

        /**
         * Called as dragging proceeds.  Signature: (event: React.SyntheticEvent, coordinateDiff: object): void
         */
        onDrag: PropTypes.func,

        /**
         * Called when the user lets go.  Signature: (event: React.SyntheticEvent, coordinateDiff: object): void
         */
        onDragEnd: PropTypes.func,
    };

    static defaultProps = {
        onDragStart: () => undefined,
        onDrag: () => undefined,
        onDragEnd: () => undefined
    };

    constructor(props) {
        super(props);
        this.originEvent = null;
        this.mousedown = this.mousedown.bind(this);
        this.mousemove = this.mousemove.bind(this);
        this.mouseup = this.mouseup.bind(this);
    }

    /**
     * Callback for mousedown events on the <div>.
     * 
     * @param {React.SyntheticEvent} event - mouse event that triggered this callback
     */
    mousedown(event) {
        if (this.originEvent === null && event.button === this.props.button) {
            event.persist();
            this.originEvent = event;
            this.props.onDragStart(event);
        }
    }

    /**
     * Callback for mousemove events on the <div>.
     * 
     * @param {React.SyntheticEvent} event - mouse event that triggered this callback
     */
    mousemove(event) {
        if (this.originEvent !== null) {
            this.props.onDrag(
                event,
                {
                    dx: event.clientX - this.originEvent.clientX,
                    dy: event.clientY - this.originEvent.clientY,
                }
            );
        }
    }

    /**
     * Callback for mouseup events on the <div>.
     * 
     * @param {React.SyntheticEvent} event - mouse event that triggered this callback
     */
    mouseup(event) {
        if (this.originEvent !== null) {
            this.props.onDragEnd(
                event,
                {
                    dx: event.clientX - this.originEvent.clientX,
                    dy: event.clientY - this.originEvent.clientY,
                }
            )
            this.originEvent = null;
        }
    }

    /**
     * @return {React.Component} a div that listens to drag events
     * @override
     */
    render() {
        let {
            button,
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
            onMouseLeave={this.mouseup}
            {...remainingProps}
        >
            {children}
        </div>
        );
    }
}

export default DragAcrossDiv;
