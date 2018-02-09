// Utility functions that don't really fit in any particular folder.

/**
 * Gets the x and y coordinates of a mouse event *relative to the top left corner of an element*.  By default, the
 * element is the event's `currentTarget`, the element to which the event listener has been attached.
 * 
 * For example, if the top left corner of the element is at screen coordinates (10, 10) and the event's screen
 * coordinates are (11, 12), then this function will return `{x: 1, y: 2}`.
 * 
 * @param {MouseEvent} event - the event for which to get relative coordinates
 * @param {Element} [relativeTo] - calculate coordinates relative to this element.  Default is event.currentTarget.
 * @return {Object} object with props x and y that contain the relative coordinates
 */
export function getRelativeCoordinates(event, relativeTo) {
    if (!relativeTo) {
        relativeTo = event.currentTarget;
    }
    const targetBoundingRect = relativeTo.getBoundingClientRect();
    return {
        x: event.clientX - targetBoundingRect.left,
        y: event.clientY - targetBoundingRect.top
    };
}
