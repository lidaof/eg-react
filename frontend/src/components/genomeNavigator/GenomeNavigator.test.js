import React from 'react';
import { mount } from 'enzyme';

import GenomeNavigator from './GenomeNavigator';

import Feature from '../../model/Feature';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import NavigationContext from '../../model/NavigationContext';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';
import { OpenInterval } from '../../model/interval/OpenInterval';

const CHROMOSOMES = [
    new Feature("chr1", new ChromosomeInterval("chr1", 0, 1000)),
    new Feature("chr2", new ChromosomeInterval("chr2", 0, 1000)),
    new Feature("chr3", new ChromosomeInterval("chr3", 0, 1000)),
];
const NAV_CONTEXT = new NavigationContext("View region", CHROMOSOMES);
var rendered = null;

beforeEach(() => {
    const selectedRegion = new DisplayedRegionModel(NAV_CONTEXT, 0, 1000);
    let component = <GenomeNavigator selectedRegion={selectedRegion} />
    rendered = mount(component);
});

const getViewModelFromMainPane = function() {
    return rendered.find('MainPane').props().viewRegion;
}

const findZoomSlider = function() {
    return rendered.find('input[type="range"]')
}

it('renders a MainPane with the right initial models', () => {
    expect(rendered.find('MainPane')).toHaveLength(1);
    let mainPaneProps = rendered.find('MainPane').props();
    expect(mainPaneProps.viewRegion).toEqual(new DisplayedRegionModel(NAV_CONTEXT));
    expect(mainPaneProps.selectedRegion).toEqual(new DisplayedRegionModel(NAV_CONTEXT, 0, 1000));
});

it('renders a zoom slider with the right value', () => {
    expect(findZoomSlider()).toHaveLength(1);
    let sliderProps = findZoomSlider().props();
    expect(sliderProps.type).toEqual('range');
    expect(sliderProps.value).toBeCloseTo(Math.log(NAV_CONTEXT.getTotalBases()));

    rendered.instance().setNewView(1000, 2000);
    rendered.update();
    let newSliderProps = findZoomSlider().props();
    expect(newSliderProps.value).toBeCloseTo(Math.log(1000));
});

it('sets the right view region when zooming', () => {
    rendered.instance().zoom(0.5, 0.5);
    rendered.update();
    let model = getViewModelFromMainPane();
    expect(model.getAbsoluteRegion()).toEqual({start: 750, end: 2250});
});

it('prohibits zooming in too far', () => {
    rendered.instance().zoom(0.001, 0);
    let model = getViewModelFromMainPane();
    expect(model.getWidth()).toBeGreaterThan(1);
});

it('setNewView() actually sets a new view', () => {
    rendered.instance().setNewView(1000, 2000);
    rendered.update();
    let model = getViewModelFromMainPane();
    expect(model.getAbsoluteRegion()).toEqual({start: 1000, end: 2000});
});

it('zoomSliderDragged() zooms properly', () => {
    findZoomSlider().simulate('change', {
        target: {value: Math.log(500)} // Target region size of 500
    });
    let model = getViewModelFromMainPane();
    expect(model.getAbsoluteRegion()).toEqual({start: 1250, end: 1750});
});
