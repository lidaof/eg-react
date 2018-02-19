import React from 'react';
import { shallow } from 'enzyme';
import DragAcrossDiv from '../DragAcrossDiv';
import { MouseButtons } from '../../util';

/**
 * An object that looks like React.MouseEvent.
 */
class MockEvent {
    constructor(obj) {
        Object.assign(this, obj);
    }

    persist() {

    }
}

it('should render children', () => {
    let component = <DragAcrossDiv button={MouseButtons.LEFT} ><p/></DragAcrossDiv>
    let wrapper = shallow(component);
    expect(wrapper.find('p')).toHaveLength(1);
});

it('should dispatch drag events correctly', () => {
    let fakeDragStart = jest.fn();
    let fakeDrag = jest.fn();
    let fakeDragEnd = jest.fn();
    let wrapper = shallow(<DragAcrossDiv
        button={MouseButtons.LEFT}
        onDragStart={fakeDragStart}
        onDrag={fakeDrag}
        onDragEnd={fakeDragEnd}
    />);
    const mousedown = new MockEvent({button: MouseButtons.LEFT, clientX: 0, clientY: 0});
    const mousemove = new MockEvent({button: MouseButtons.LEFT, clientX: 10, clientY: 10});
    const mouseup = new MockEvent({button: MouseButtons.LEFT, clientX: 20, clientY: 20})
    wrapper.simulate('mousedown', mousedown);
    wrapper.simulate('mousemove', mousemove);
    wrapper.simulate('mouseup', mouseup);

    expect(fakeDragStart).toHaveBeenCalledTimes(1);
    expect(fakeDragStart).toHaveBeenCalledWith(mousedown);
    expect(fakeDrag).toHaveBeenCalledTimes(1);
    expect(fakeDrag).toHaveBeenCalledWith(mousemove, {dx: 10, dy: 10});
    expect(fakeDragEnd).toHaveBeenCalledTimes(1);
    expect(fakeDragEnd).toHaveBeenCalledWith(mouseup, {dx: 20, dy: 20});
});

it('should only dispatch drag events for the requested button', () => {
    let fakeDragStart = jest.fn();
    let wrapper = shallow(<DragAcrossDiv
        button={MouseButtons.LEFT}
        onDragStart={fakeDragStart}
    />);
    const mousedown = new MockEvent({button: MouseButtons.RIGHT});
    wrapper.simulate('mousedown', mousedown);
    expect(fakeDragStart).not.toHaveBeenCalled();
});

it('should only dispatch drag events if dragging has started', () => {
    let fakeDrag = jest.fn();
    let wrapper = shallow(<DragAcrossDiv
        button={MouseButtons.LEFT}
        onDrag={fakeDrag}
    />);
    wrapper.simulate('mousemove', new MockEvent({button: MouseButtons.LEFT}));
    expect(fakeDrag).not.toHaveBeenCalled();
});
