import React from 'react';
import { shallow } from 'enzyme';
import TrackLegend from '../TrackLegend';
import TrackModel from '../../model/TrackModel';

const wrapper = shallow(<TrackLegend height={100} trackModel={new TrackModel({name: "myTrack"})} />);

describe("TrackLegend", () => {
    it("renders a <svg> with proper width and height", () => {
        const svgs = wrapper.find("svg");
        expect(svgs).toHaveLength(1);
        const svg = svgs.get(0);
        expect(svg.props.width).toBe(TrackLegend.WIDTH);
        expect(svg.props.height).toBe(100);
    });

    it("renders a foreignObject element with the track's name and right width", () => {
        const foreignObjects = wrapper.find("foreignObject");
        expect(foreignObjects).toHaveLength(1);
        const foreignObject = foreignObjects.get(0);
        expect(foreignObject.props.width).toBeLessThan(TrackLegend.WIDTH);
        expect(foreignObjects.text()).toBe("myTrack");
    });
});
