import PropTypes from 'prop-types';
import React from 'react';

export const LEFT_MOUSE = 0;
export const MIDDLE_MOUSE = 1;
export const RIGHT_MOUSE = 2;

class DomDragListener extends React.Component {
    constructor(props) {
        super(props);

        this.dragDispatcher = null;
    }

    _initDragDispatcher() {
        this.dragDispatcher = new DragAcrossDispatcher(this.props.button, {
            dragStart: this.props.onDragStart,
            drag: this.props.onDrag,
            dragEnd: this.props.onDragEnd
        }).listenTo(this.props.node);
    }

    componentDidMount() {
        this._initDragDispatcher();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.button !== this.props.button) {
            this.dragDispatcher.stopListeningTo(this.props.node);
            this._initDragDispatcher();
        }
    }

    /**
     * Removes event listeners.
     * 
     * @override
     */
    componentWillUnmount() {
        this.dragDispatcher.stopListeningTo(this.props.node);
    }

    render() {
        return null;
    }
}

export default DomDragListener;

DomDragListener.propTypes = {
    button: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
}


/**
 * Fired when the event listener has been asked to perform an action while in an inappropriate state.  Not exported
 * because no one catches it specifically; the throwing of this error indicates a bug.
 * 
 * @author Silas Hsu
 */
class ListenerStateError extends Error {}

/**
 * A class that facilitates listening to the type of mouse event where the user moves the mouse across the screen while
 * holding a button down.  Not to be confused with the native DragEvents, which happen when a DOM element gets moved
 * across the screen.
 * 
 * @author Silas Hsu
 */
class DragAcrossDispatcher {
    constructor(mouseButton, callbacks) {
        if (!this._isValidButton(mouseButton)) {
            throw new ListenerStateError("Invalid mouse button");
        }
        this._mouseButton = mouseButton;
        this._originEvent = null;
        this._callbacks = callbacks || {};
        this._isSubscribed = false;

        this.mousedown = this.mousedown.bind(this);
        this.mousemove = this.mousemove.bind(this);
        this.mouseupOrMouseleave = this.mouseupOrMouseleave.bind(this);
    }

    _isValidButton(button) {
        return (button === LEFT_MOUSE || button === MIDDLE_MOUSE || button === RIGHT_MOUSE)
    }

    /**
     * 
     * @param {HTMLElement} domElement 
     */
    listenTo(domElement) {
        if (this._isSubscribed) {
            throw new ListenerStateError("This listener is already subscribed to an element");
        }
        domElement.addEventListener('mousedown', this.mousedown);
        domElement.addEventListener('mousemove', this.mousemove);
        domElement.addEventListener('mouseup', this.mouseupOrMouseleave);
        domElement.addEventListener('mouseleave', this.mouseupOrMouseleave);
        this._isSubscribed = true;
        return this;
    }

    /**
     * 
     * @param {HTMLElement} domElement 
     */
    stopListeningTo(domElement) {
        if (!this._isSubscribed) {
            throw new ListenerStateError("This listener is not currently subscribed to an element");
        }
        domElement.removeEventListener('mousedown', this.mousedown);
        domElement.removeEventListener('mousemove', this.mousemove);
        domElement.removeEventListener('mouseup', this.mouseupOrMouseleave);
        domElement.removeEventListener('mouseleave', this.mouseupOrMouseleave);
        this._isSubscribed = false;
        return this;
    }

    getOriginEvent() {
        return this._originEvent;
    }

    /**
     * Initialze the drag, and call the dragStart callback.
     * 
     * @param {MouseEvent} event - a mousedown event fired from the subscribed element
     */
    mousedown(event) {
        if (this._originEvent === null && event.button === this._mouseButton) {
            this._originEvent = event;
            if (this._callbacks.dragStart) {
                this._callbacks.dragStart(event);
            }
        }
    }

    /**
     * If dragging has been initialized, calls the drag callback.
     * 
     * @param {MouseEvent} event - a mousemove event fired from the subscribed element
     */
    mousemove(event) {
        if (this._originEvent && this._callbacks.drag) {
            this._callbacks.drag(
                event,
                {
                    dx: event.clientX - this._originEvent.clientX,
                    dy: event.clientY - this._originEvent.clientY,
                }
            );
        }
    }

    /**
     * If dragging has been initialized, calls the dragEnd callback.
     * 
     * @param {MouseEvent} event - a mouseup or mouseleave event fired from the subscribed element
     */
    mouseupOrMouseleave(event) {
        if (this._originEvent && event.button === this._mouseButton) {
            if (this._callbacks.dragEnd) {
                this._callbacks.dragEnd(
                    event,
                    {
                        dx: event.clientX - this._originEvent.clientX,
                        dy: event.clientY - this._originEvent.clientY,
                    }
                );
            }
            this._originEvent = null;
        }
    }
}
