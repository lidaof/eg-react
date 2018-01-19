import React from 'react';
import { storiesOf } from '@storybook/react';

import MainPane from '../components/genomeNavigator/MainPane';

import Feature from '../model/Feature';
import { Genome, Chromosome } from '../model/Genome';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import NavigationContext from '../model/NavigationContext';

const CHROMOSOMES = [
    new Chromosome("chr1", 1500),
    new Chromosome("chr2", 2500),
    new Chromosome("chr3", 3500),
    new Chromosome("chr4", 4500),
];
const NAV_CONTEXT = new Genome("Genome", CHROMOSOMES).makeNavContext();

const view1 = new DisplayedRegionModel(NAV_CONTEXT);
view1.setRegion(0, 7500); // Chromosomes 1 to 3

const view2 = new DisplayedRegionModel(NAV_CONTEXT);
view2.setRegion(7000, 12000);

const selectedRegion = new DisplayedRegionModel(NAV_CONTEXT);
selectedRegion.setRegion(1000, 2000);

const mainPaneView1 = {
    storyName: "Main pane, view 1",
    viewRegion: view1,
    component: <MainPane
        viewRegion={view1}
        selectedRegion={selectedRegion}
        regionSelectedCallback={(start, end) => window.newSelectedRegion = {start: start, end: end}}
        dragCallback={() => {}}
        gotoButtonCallback={() => {}}
        zoomCallback={() => {}}
    />
}

const mainPaneView2 = {
    storyName: "Main pane, view 2",
    viewRegion: view2,
    component: <MainPane
        viewRegion={view2}
        selectedRegion={selectedRegion}
        regionSelectedCallback={() => {}}
        dragCallback={() => {}}
        gotoButtonCallback={(start, end) => window.gotoButtonRegion = {start: start, end: end}}
        zoomCallback={(amount, focusPoint) => window.zoomArgs = {amount: amount, focusPoint: focusPoint}}
    />
}

export const STORIES = {
    mainPaneView1: mainPaneView1,
    mainPaneView2: mainPaneView2
}

export const STORY_KIND = "Genome navigator";
let storyInterface = storiesOf(STORY_KIND, module);
for (let storyKey in STORIES) {
    let story = STORIES[storyKey];
    storyInterface.add(story.storyName, () => story.component);
}
