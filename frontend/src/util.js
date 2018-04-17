/**
 * Utility functions that don't really fit in any particular folder.
 * 
 * @author Silas Hsu
 */ 
import parseColor from 'parse-color';

/**
 * Button consts found in MouseEvents.  See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
export const MouseButtons = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};

/**
 * Gets the x and y coordinates of a mouse event *relative to the top left corner of an element*.  By default, the
 * element is the event's `currentTarget`, the element to which the event listener has been attached.
 * 
 * For example, if the top left corner of the element is at screen coordinates (10, 10) and the event's screen
 * coordinates are (11, 12), then this function will return `{x: 1, y: 2}`.
 * 
 * @param {MouseEvent} event - the event for which to get relative coordinates
 * @param {Element} [relativeTo] - calculate coordinates relative to this element.  Default is event.currentTarget.
 * @return {Coordinate} object with props x and y that contain the relative coordinates
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

/**
 * Given coordinates relative to the top left corner of an element, gets the page coordinates.
 * 
 * @param {Element} relativeTo - element to use as reference point
 * @param {number} relativeX - x coordinates inside an element
 * @param {number} relativeY - y coordinates inside an element
 * @return {Coordinate} the page coordinates
 */
export function getPageCoordinates(relativeTo, relativeX, relativeY) {
    const targetBoundingRect = relativeTo.getBoundingClientRect();
    return {
        x: window.scrollX + targetBoundingRect.left + relativeX,
        y: window.scrollY + targetBoundingRect.top + relativeY
    };
}

/**
 * Debug function for the shouldComponentUpdate method of React.PureComponent.  Logs what props/state changed if there
 * is a rerender.
 * 
 * @param {Object} thisProps - current props
 * @param {Object} thisState - current state
 * @param {Object} nextProps - next props component will receive
 * @param {Object} nextState - next state component will receive
 * @return {boolean} whether component should update, according to React.PureComponent
 */
export function debugShouldComponentUpdate(thisProps, thisState, nextProps, nextState) {
    for (let propName in nextProps) {
        if (thisProps[propName] !== nextProps[propName]) {
            console.log(propName);
            return true;
        } 
    }

    for (let stateName in nextState) {
        if (thisState[stateName] !== nextState[stateName]) {
            console.log(stateName);
            return true;
        } 
    }

    return false;
}

/**
 * Gets a color that contrasts well with the input color.  Useful for determining font color for a given background
 * color.  Thanks to https://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
 * 
 * @param {string} color - color for which to find a contrasting color
 * @return {string} a color that contrasts well with the input color
 */
export function getContrastingColor(color) {
    const parsedColor = parseColor(color);
    const [r, g, b] = parsedColor.rgb;
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (brightness < 0.5) {
        return "white";
    } else {
        return "black";
    }
}

/**
 * A (x, y) coordinate pair.
 * 
 * @typedef {Object} Coordinate
 * @property {number} x - the x component
 * @property {number} y - the y component
 */
