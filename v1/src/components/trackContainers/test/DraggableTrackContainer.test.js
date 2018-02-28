import React from 'react';
import { shallow } from 'enzyme';
import DraggableTrackContainer from '../DraggableTrackContainer';
import makeToyRegion from '../../../model/test/toyRegion';
import TrackModel from '../../../model/TrackModel';

const dragRegionStart = 0;
const dragRegionEnd = 10;

it("sets tracks' xOffset prop properly when the view is dragged", () => {
    let wrapper = shallow(<DraggableTrackContainer
        trackElements={[<div/>, <div/>]} 
        viewRegion={makeToyRegion()}
        visualizationWidth={1}
    />);
    let instance = wrapper.instance();

    // Start a drag and drag it 10 pixels
    instance.viewDragStart(new MouseEvent('mousedown'));
    instance.viewDrag(dragRegionStart, dragRegionEnd, undefined, {dx: 10});
    wrapper.update();
    expect(wrapper.children().length).toBeGreaterThan(0);
    wrapper.children().map(child => expect(child.prop('xOffset')).toBe(10));

    // End the previous drag, drag it another 10 pixels
    instance.viewDragEnd(undefined, undefined, undefined, {dx: 10});
    instance.viewDragStart(new MouseEvent('mousedown'));
    instance.viewDrag(dragRegionStart, dragRegionEnd, undefined, {dx: 10});
    wrapper.update();
    wrapper.children().map(child => expect(child.prop('xOffset')).toBe(20));
});

it("calls the newRegionCallback when dragging ends, IF dragged far enough", () => {
    let newRegionCallback = jest.fn();
    let wrapper = shallow(<DraggableTrackContainer
        trackElements={[<div/>]}
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

it('resets xOffset after receiving a new view region', () => {
    let wrapper = shallow(<DraggableTrackContainer
        trackElements={[<div/>]}
        viewRegion={makeToyRegion()}
        visualizationWidth={1}
    />);

    // Set an initial state of xOffset = 10
    wrapper.setState({xOffset: 10});
    expect(wrapper.children().length).toBeGreaterThan(0);
    wrapper.children().map(child => expect(child.prop('xOffset')).toBe(10));

    wrapper.setProps({viewRegion: makeToyRegion()});
    wrapper.children().map(child => expect(child.prop('xOffset')).toBe(0));
});
