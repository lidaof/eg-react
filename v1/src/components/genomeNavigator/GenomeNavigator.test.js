import React from 'react';
import { shallow } from 'enzyme';

import GenomeNavigator from './GenomeNavigator';

import Feature from '../../model/Feature';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import NavigationContext from '../../model/NavigationContext';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

const CHROMOSOMES = [
    new Feature("chr1", new ChromosomeInterval("chr1", 0, 1000)),
    new Feature("chr2", new ChromosomeInterval("chr2", 0, 1000)),
    new Feature("chr3", new ChromosomeInterval("chr3", 0, 1000)),
];

describe('GenomeNavigator', () => {
    var initViewRegion = null;
    var initSelectedRegion = null;
    var render = null;

    beforeEach(() => {
        initViewRegion = new DisplayedRegionModel(new NavigationContext("View region", CHROMOSOMES));
        initViewRegion.setRegion(0, 1000);
        initSelectedRegion = new DisplayedRegionModel(new NavigationContext("Selected region", CHROMOSOMES));
        initSelectedRegion.setRegion(0, 1000);

        let component = <GenomeNavigator
            viewModel={initViewRegion}
            selectedRegionModel={initSelectedRegion}
            regionSelectedCallback={() => {}}
        />
        render = shallow(component);
    });

    const getViewModelFromMainPane = function() {
        return render.find('MainPane').props().model;
    }

    it('renders a MainPane with the right models', () => {
        expect(render.find('MainPane')).toHaveLength(1);
        let mainPaneProps = render.find('MainPane').props();
        expect(mainPaneProps.model).toBe(initViewRegion);
        expect(mainPaneProps.selectedRegionModel).toBe(initSelectedRegion);
    });

    it('renders a zoom slider with the right value', () => {
        expect(render.find('input')).toHaveLength(1);
        let sliderProps = render.find('input').props();
        expect(sliderProps.type).toEqual('range');
        expect(sliderProps.value).toBeCloseTo(Math.log(initViewRegion.getWidth()));
    });

    it('sets the right view region when zooming', () => {
        render.instance().zoom(2, 0.5);
        let model = getViewModelFromMainPane();
        expect(model).not.toBe(initViewRegion); // model should be replaced, not mutated
        expect(model.getAbsoluteRegion()).toEqual({start: 0, end: 2000});
    });

    it('prohibits zooming in too far', () => {
        render.instance().zoom(0.001, 0);
        let model = getViewModelFromMainPane();
        expect(model.getWidth()).toBeGreaterThan(1);
    });

    it('setNewView() replaces the model, and does not mutate it', () => {
        render.instance().setNewView(1000, 2000);
        let model = getViewModelFromMainPane();
        expect(model).not.toBe(initViewRegion);
        expect(model.getAbsoluteRegion()).toEqual({start: 1000, end: 2000});
    });

    it('zoomSliderDragged() zooms properly', () => {
        render.find('input').simulate('change', {
            target: {value: Math.log(500)} // Target region size of 500
        });
        let model = getViewModelFromMainPane();
        expect(model).not.toBe(initViewRegion);
        expect(model.getAbsoluteRegion()).toEqual({start: 250, end: 750});
    });
});
