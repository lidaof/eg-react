import React from 'react';
import { mount } from 'enzyme';

import GenomeNavigator from './GenomeNavigator';
import { ReduxProvider } from '../../testUtils';

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
var instance = null;
beforeEach(() => {
    const selectedRegion = new DisplayedRegionModel(NAV_CONTEXT, 0, 1000);
    let element = (
        <ReduxProvider>
            <GenomeNavigator ref={inst => instance=inst} selectedRegion={selectedRegion} />
        </ReduxProvider>
    );
    rendered = mount(element);
});

const getViewModelFromMainPane = function() {
    return rendered.find('MainPane').props().viewRegion;
}

const findZoomSlider = function() {
    return rendered.find('input[type="range"]')
}

it('renders a MainPane with the right initial models', () => {
    expect(rendered.find('MainPane')).toHaveLength(1);
    const mainPaneProps = rendered.find('MainPane').props();
    expect(mainPaneProps.viewRegion).toEqual(new DisplayedRegionModel(NAV_CONTEXT));
    expect(mainPaneProps.selectedRegion).toEqual(new DisplayedRegionModel(NAV_CONTEXT, 0, 1000));
});

it('renders a zoom slider with the right value', () => {
    expect(findZoomSlider()).toHaveLength(1);
    const sliderProps = findZoomSlider().props();
    expect(sliderProps.type).toEqual('range');
    expect(sliderProps.value).toBeCloseTo(Math.log(NAV_CONTEXT.getTotalBases()));

    instance.setNewView(1000, 2000);
    rendered.update();
    const newSliderProps = findZoomSlider().props();
    expect(newSliderProps.value).toBeCloseTo(Math.log(1000));
});

it('sets the right view region when zooming', () => {
    instance.zoom(0.5, 0.5);
    rendered.update();
    const model = getViewModelFromMainPane();
    expect(model.getContextCoordinates()).toEqual({start: 750, end: 2250});
});

it('prohibits zooming in too far', () => {
    instance.zoom(0.001, 0);
    const model = getViewModelFromMainPane();
    expect(model.getWidth()).toBeGreaterThan(1);
});

it('setNewView() actually sets a new view', () => {
    instance.setNewView(1000, 2000);
    rendered.update();
    const model = getViewModelFromMainPane();
    expect(model.getContextCoordinates()).toEqual({start: 1000, end: 2000});
});

it('zoomSliderDragged() zooms properly', () => {
    findZoomSlider().simulate('change', {
        target: {value: Math.log(500)} // Target region size of 500
    });
    const model = getViewModelFromMainPane();
    expect(model.getContextCoordinates()).toEqual({start: 1250, end: 1750});
});
