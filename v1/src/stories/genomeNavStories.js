import React from 'react';
import { storiesOf } from '@storybook/react';

import MainPane from '../components/genomeNavigator/MainPane';

import Feature from '../model/Feature';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import NavigationContext from '../model/NavigationContext';



const CHROMOSOMES = [
    new Feature("chr1", 0, 1500, true),
    new Feature("chr2", 0, 2500, true),
    new Feature("chr3", 0, 3500, true),
    new Feature("chr4", 0, 4500, true),
];

const view1 = new DisplayedRegionModel(new NavigationContext("View 1", CHROMOSOMES));
view1.setRegion(0, 7500); // Chromosomes 1 to 3

const view2 = new DisplayedRegionModel(new NavigationContext("View 2", CHROMOSOMES));
view2.setRegion(7000, 12000);

const selectedRegion = new DisplayedRegionModel(new NavigationContext("Selected region", CHROMOSOMES));
selectedRegion.setRegion(1000, 2000);

const mainPaneView1 = {
    storyName: "Main pane, view 1",
    viewRegion: view1,
    component: <MainPane
        model={view1}
        selectedRegionModel={selectedRegion}
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
        model={view2}
        selectedRegionModel={selectedRegion}
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
