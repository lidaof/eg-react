import PropTypes from 'prop-types';
import React from 'react';

export const LEFT_MOUSE = 0;
export const MIDDLE_MOUSE = 1;
export const RIGHT_MOUSE = 2;

/**
 * A React component that listens for drag-across events as specified by DragAcrossDispatcher.  To use, pass a DOM ref
 * through the `node` property, and the component will automatically listen for events on that node.
 * 
 * @author Silas Hsu
 */
class DomDragListener extends React.Component {
    constructor(props) {
        super(props);

        this.dragDispatcher = null;
    }

    /**
     * Makes a new DragAcrossDispatcher that listens to `this.props.node`.
     */
    _initDragDispatcher() {
        this.dragDispatcher = new DragAcrossDispatcher(this.props.button, {
            dragStart: this.props.onDragStart,
            drag: this.props.onDrag,
            dragEnd: this.props.onDragEnd
        }).listenTo(this.props.node);
    }

    /**
     * Starts listening to drag events.
     * 
     * @override
     */
    componentDidMount() {
        this._initDragDispatcher();
    }

    /**
     * Shallowly compares `this.props` and `nextProps`.  Returns true if there is any difference, otherwise false.
     * 
     * @param {any} nextProps - next props that the component will receive
     * @return {boolean} whether the component should update
     * @override
     */
    shouldComponentUpdate(nextProps) {
        for (let key in this.props) {
            if (this.props[key] !== nextProps[key]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Rebinds event listeners on any changes.
     * 
     * @override
     */
    componentDidUpdate(prevProps) {
        this.dragDispatcher.stopListeningTo(prevProps.node);
        this._initDragDispatcher();
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
 * To use this class, pass the appropriate mouse button and an object of callbacks to the constructor.  The callbacks
 * will be executed upon detection of drag-across events.
 * 
 * @author Silas Hsu
 */
class DragAcrossDispatcher {
    /**
     * An object containing callbacks for DragAcrossDispatcher.
     * 
     * @typedef {Object} DragAcrossDispatcher~Callbacks
     * @property {function} [dragStart] - called upon a mousedown of the appropriate button
     * @property {function} [drag] - called upon dragging anywhere after drag start
     * @property {function} [dragEnd] - called upon mouse release after drag start
     */

    /**
     * Makes a new DragAcrossDispatcher specialized for a certain mouse button.
     * 
     * @param {number} mouseButton - the mouse button for which to listen
     * @param {DragAcrossDispatcher~Callbacks} callbacks - callbacks to be executed upon detection of drag-across events
     */
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

    /**
     * @param {number} button - a button number
     * @return {boolean} whether the input button number is a valid mouse button.
     */
    _isValidButton(button) {
        return (button === LEFT_MOUSE || button === MIDDLE_MOUSE || button === RIGHT_MOUSE)
    }

    /**
     * Start listening for drag-across events on a DOM element.
     * 
     * @param {HTMLElement} domElement - element on which to add event listeners
     * @return {DragAcrossDispatcher} this
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
     * Stop listening for drag-across events on a DOM element.
     * 
     * @param {HTMLElement} domElement - element from which to remove event listeners
     * @return {DragAcrossDispatcher} this
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

    /**
     * If a drag-across event is currently happening, gets the mouse event that started the drag.  Otherwise, returns
     * null.
     * 
     * @return {MouseEvent} the event that started the current drag-across event, or null
     */
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
