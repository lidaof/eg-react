import { LEFT_MOUSE, RIGHT_MOUSE, DomDragListener, ListenerStateError } from './DomDragListener';
import React from 'react';
import { mount } from 'enzyme';

describe('DomDragListener', () => {
    var domNode = null;

    beforeAll(() => {
        domNode = document.createElement('div');
    });

    it('throws an error if given an unknown button', () => {
        let component = <DomDragListener
            button={Number.MAX_SAFE_INTEGER /* Im going to assume this is an invalid button */}
            node={domNode}
        />
        expect(() => mount(component)).toThrow(ListenerStateError);
    });

    it('should dispatch drag events correctly', () => {
        let fakeDragStart = jest.fn();
        let fakeDrag = jest.fn();
        let fakeDragEnd = jest.fn();
        let component = <DomDragListener
            button={LEFT_MOUSE}
            node={domNode}
            onDragStart={fakeDragStart}
            onDrag={fakeDrag}
            onDragEnd={fakeDragEnd}
        />
        let mounted = mount(component);

        let mousedown = new MouseEvent('mousedown', {button: LEFT_MOUSE, clientX: 0, clientY: 0});
        let mousemove = new MouseEvent('mousemove', {button: LEFT_MOUSE, clientX: 10, clientY: 10});
        let mouseup = new MouseEvent('mouseup', {button: LEFT_MOUSE, clientX: 20, clientY: 20});
        domNode.dispatchEvent(mousedown);
        domNode.dispatchEvent(mousemove);
        domNode.dispatchEvent(mouseup);

        expect(fakeDragStart).toHaveBeenCalledTimes(1);
        expect(fakeDragStart).toHaveBeenCalledWith(mousedown);
        expect(fakeDrag).toHaveBeenCalledTimes(1);
        expect(fakeDrag).toHaveBeenCalledWith(mousemove, {dx: 10, dy: 10});
        expect(fakeDragEnd).toHaveBeenCalledTimes(1);
        expect(fakeDragEnd).toHaveBeenCalledWith(mouseup, {dx: 20, dy: 20});

        mounted.unmount();
    });

    it('should only dispatch drag events for the requested button', () => {
        let fakeDragStart = jest.fn();
        let component = <DomDragListener
            button={LEFT_MOUSE}
            node={domNode}
            onDragStart={fakeDragStart}
        />
        let mounted = mount(component);

        let mousedown = new MouseEvent('mousedown', {button: RIGHT_MOUSE});
        domNode.dispatchEvent(mousedown);
        expect(fakeDragStart).not.toHaveBeenCalled();

        mounted.unmount();
    });

    it('should only dispatch drag events if dragging has started', () => {
        let fakeDrag = jest.fn();
        let component = <DomDragListener
            button={LEFT_MOUSE}
            node={domNode}
            onDrag={fakeDrag}
        />
        let mounted = mount(component);

        let mousedown = new MouseEvent('mousemove', {button: LEFT_MOUSE});
        domNode.dispatchEvent(mousedown);
        expect(fakeDrag).not.toHaveBeenCalled();

        mounted.unmount();
    });
});
