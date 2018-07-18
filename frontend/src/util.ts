/**
 * Utility functions that don't really fit in any particular folder.
 * 
 * @author Silas Hsu
 */ 
import parseColor from 'parse-color';

interface Coordinate {
    x: number;
    y: number;
}

/**
 * Button consts found in MouseEvents.  See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2
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
export function getRelativeCoordinates(event: MouseEvent, relativeTo?: Element): Coordinate {
    if (!relativeTo) {
        relativeTo = event.currentTarget as Element;
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
export function getPageCoordinates(relativeTo: Element, relativeX: number, relativeY: number): Coordinate {
    const targetBoundingRect = relativeTo.getBoundingClientRect();
    return {
        x: window.scrollX + targetBoundingRect.left + relativeX,
        y: window.scrollY + targetBoundingRect.top + relativeY
    };
}

/**
 * Gets a color that contrasts well with the input color.  Useful for determining font color for a given background
 * color.  If parsing fails for the input color, returns black.
 * 
 * Credit goes to https://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
 * 
 * @param {string} color - color for which to find a contrasting color
 * @return {string} a color that contrasts well with the input color
 */
export function getContrastingColor(color: string): string {
    const parsedColor = parseColor(color);
    if (!parsedColor.rgb) {
        return "black";
    }
    const [r, g, b] = parsedColor.rgb;
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (brightness < 0.5) {
        return "white";
    } else {
        return "black";
    }
}

/**
 * Returns a copy of the input list, ensuring its length is below `limit`.  If the list is too long, selects
 * equally-spaced elements from the original list.  Note that if the input is sorted, the output will be sorted as well.
 * 
 * @param {T[]} list - list for which to ensure a max length
 * @param {number} limit - maximum length of the result list
 * @return {T[]} copy of list with max length ensured
 */
export function ensureMaxListLength<T>(list: T[], limit: number): T[] {
    if (list.length <= limit) {
        return list;
    }

    const selectedItems: T[] = [];
    for (let i = 0; i < limit; i++) {
        const fractionIterated = i / limit;
        const selectedIndex = Math.ceil(fractionIterated * list.length);
        selectedItems.push(list[selectedIndex]);
    }
    return selectedItems;
}

/**
 * @param {number} bases - number of bases
 * @return {string} human-readable string representing that number of bases
 */
export function niceBpCount(bases: number) {
    const rounded = Math.floor(bases);
    if (rounded >= 750000) {
        return `${(rounded/1000000).toFixed(1)} Mb`;
    } else if (rounded >= 10000) {
        return `${(rounded/1000).toFixed(1)} kb`;
    } else {
        return `${rounded} bp`;
    }
}
