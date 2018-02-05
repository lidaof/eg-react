import React from 'react';
import { shallow } from 'enzyme';
import DraggableTrackContainer from '../DraggableTrackContainer';
import makeToyRegion from '../../model/test/toyRegion';
import TrackModel from '../../model/TrackModel';

const dragRegionStart = 0;
const dragRegionEnd = 10;

it("sets tracks' xOffset prop when the view is dragged, AND resets a track's xOffset when it loads data", () => {
    let wrapper = shallow(<DraggableTrackContainer
        trackComponents={[<div/>, <div/>]} 
        viewRegion={makeToyRegion()}
        visualizationWidth={1}
    />);
    let instance = wrapper.instance();

    instance.viewDragStart(new MouseEvent('mousedown'));
    instance.viewDrag(dragRegionStart, dragRegionEnd, undefined, {dx: 10});
    wrapper.update();
    expect(wrapper.children().length).toBeGreaterThan(0);
    wrapper.children().map(child => expect(child.prop('xOffset')).toBe(10));
    
    // Start another drag!
    instance.viewDragEnd(dragRegionStart, dragRegionEnd, undefined, {dx: 10});
    instance.viewDragStart(new MouseEvent('mousedown'));
    instance.viewDrag(dragRegionStart, dragRegionEnd, undefined, {dx: 10});
    wrapper.update();
    wrapper.children().map(child => expect(child.prop('xOffset')).toBe(20));

    // Let's pretend a track finished loading data!
    instance.resetTrackOffset(0); // It's OK since earlier we asserted at least 1 rendered track
    wrapper.update();
    expect(wrapper.childAt(0).prop('xOffset')).toBe(0);
    wrapper.children().slice(1).map(child => expect(child.prop('xOffset')).toBe(20));
});

it("calls the newRegionCallback when dragging ends, IF dragged far enough", () => {
    let newRegionCallback = jest.fn();
    let wrapper = shallow(<DraggableTrackContainer
        trackComponents={[<div/>]}
        viewRegion={makeToyRegion()}
        visualizationWidth={1}
        onNewRegion={newRegionCallback}
    />);
    let instance = wrapper.instance();
    instance.viewDragEnd(
        dragRegionStart, dragRegionEnd, undefined, {dx: DraggableTrackContainer.MIN_DRAG_DISTANCE_FOR_REFRESH - 1}
    );
    expect(newRegionCallback).not.toHaveBeenCalled();

    instance.viewDragEnd(
        dragRegionStart, dragRegionEnd, undefined, {dx: DraggableTrackContainer.MIN_DRAG_DISTANCE_FOR_REFRESH}
    );
    expect(newRegionCallback).toHaveBeenCalledTimes(1);
    expect(newRegionCallback).toHaveBeenCalledWith(dragRegionStart, dragRegionEnd);
});