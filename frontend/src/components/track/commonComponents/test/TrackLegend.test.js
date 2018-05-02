import React from 'react';
import { shallow } from 'enzyme';
import TrackLegend from '../TrackLegend';
import TrackModel from '../../../../model/TrackModel';

const TRACK_MODEL = new TrackModel({name: "Right on track!"});

it("renders the track's name", () => {
    const wrapper = shallow(<TrackLegend trackModel={TRACK_MODEL} height={1} />);
    expect(wrapper.find('p').text()).toEqual(TRACK_MODEL.getDisplayLabel());
});

it("renders a svg when given a scale", () => {
    const wrapper = shallow(<TrackLegend trackModel={TRACK_MODEL} height={1} axisScale={() => undefined} />);
    const svg = wrapper.find("svg");
    expect(svg).toHaveLength(1);
    expect(svg.props().height).toBe(1);
});
