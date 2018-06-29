import React from 'react';
import { shallow } from 'enzyme';

import DragAcrossView from '../DragAcrossView';
import { MouseButtons } from '../../util';
import makeToyRegion from '../../model/test/toyRegion';
import LinearDrawingModel from '../../model/LinearDrawingModel';

const VIEW_WIDTH = 100;
const viewRegion = makeToyRegion();
const drawModel = new LinearDrawingModel(viewRegion, VIEW_WIDTH);

let viewDragStartCallback = jest.fn();
let viewDragCallback = jest.fn();
let viewDragEndCallback = jest.fn();
let wrapper = shallow(
    <DragAcrossView
        button={MouseButtons.LEFT}
        viewRegion={viewRegion}
        drawModel={drawModel}
        onViewDragStart={viewDragStartCallback}
        onViewDrag={viewDragCallback}
        onViewDragEnd={viewDragEndCallback}
        widthOverride={VIEW_WIDTH}
    />
);
let instance = wrapper.instance();

beforeEach(() => {
    viewDragStartCallback.mockClear();
    viewDragCallback.mockClear();
    viewDragEndCallback.mockClear();
});

it("calls the onViewDragStart callback and w/ the right args", () => {
    const event = {};
    instance.dragStart(event);
    expect(viewDragStartCallback).toHaveBeenCalledTimes(1);
    expect(viewDragStartCallback).toHaveBeenCalledWith(event);
});

/**
 * onViewDrag and onViewDragEnd basically do the same thing, so we have this function.
 * 
 * @param {string} functionName - function to call on the DragAcrossView instance
 * @param {(): void} mockCallback - callback to inspect
 */
const testDrag = function(functionName, mockCallback) {
    const event = {};
    let coordinateDiff = { dx: 0, dy: 0 };
    let contextInterval = viewRegion.getContextCoordinates();
    instance[functionName](event, coordinateDiff);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(contextInterval.start, contextInterval.end, event, coordinateDiff);

    mockCallback.mockClear();

    const coordinateDiff2 = { dx: VIEW_WIDTH, dy: 0 };
    // Dragged to the right, and therefore the view region should move one whole width to the LEFT.
    const expectedStart = contextInterval.start - viewRegion.getWidth();
    const expectedEnd = contextInterval.end - viewRegion.getWidth();
    instance[functionName](event, coordinateDiff2);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(expectedStart, expectedEnd, event, coordinateDiff2);
}

it("calls the onViewDrag callback and with the right args", () => {
    testDrag("drag", viewDragCallback);
});

/**
 * A copy-paste of the previous unit, except with viewDragEnd
 */
it("calls the onViewDragEnd callback and with the right args", () => {
    testDrag("dragEnd", viewDragEndCallback);
});
