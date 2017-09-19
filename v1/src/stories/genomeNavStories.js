import DisplayedRegionModel from '../model/DisplayedRegionModel';
import MainPane from '../components/genomeNavigator/MainPane';
import React from 'react';
import { storiesOf } from '@storybook/react';

const CHROMOSOMES = [
    {name: "chr1", lengthInBases: 1500},
    {name: "chr2", lengthInBases: 2500},
    {name: "chr3", lengthInBases: 3500},
    {name: "chr4", lengthInBases: 4500}
]
const view1 = new DisplayedRegionModel("View 1", CHROMOSOMES);
view1.setRegion(0, 7500); // Chromosomes 1 to 3

const view2 = new DisplayedRegionModel("View 2", CHROMOSOMES);
view2.setRegion(7000, 12000);

const selectedRegion = new DisplayedRegionModel("Selected region", CHROMOSOMES);
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
