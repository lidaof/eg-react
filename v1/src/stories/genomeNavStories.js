import Chromosomes from '../components/genomeNavigator/Chromosomes';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import { LEFT_MOUSE } from '../components/DomDragListener';
import React from 'react';
import Ruler from '../components/genomeNavigator/Ruler';
import SelectionBox from '../components/genomeNavigator/SelectionBox';
import SvgContainer from '../components/SvgContainer';
import { storiesOf } from '@storybook/react';

const STORIES = [];
export const STORY_KIND = "Genome navigator";

export const model = new DisplayedRegionModel("Wow very genome", [
    {name: "chr1", lengthInBases: 1500},
    {name: "chr2", lengthInBases: 2500},
    {name: "chr3", lengthInBases: 3500},
]);
model.setRegion(0, model.getGenomeLength());

export const chromosomeTest = {
    storyName: "Chromosomes",
    component: <SvgContainer model={model}><Chromosomes/></SvgContainer>
};
STORIES.push(chromosomeTest);

export const rulerTest = {
    storyName: "Ruler",
    component: <SvgContainer model={model}><Ruler yOffset={40}/></SvgContainer>
}
STORIES.push(rulerTest);

export const selectBoxTest = {
    storyName: "Selection box",
    component: <SvgContainer model={model}>
        <SelectionBox
            button={LEFT_MOUSE}
            regionSelectedCallback={(start, end) => window.newRegion = {start: start, end: end}}
            yOffset={20}
        />
    </SvgContainer>,
};
STORIES.push(selectBoxTest);

let storyInterface = storiesOf(STORY_KIND, module);
for (let story of STORIES) {
    storyInterface.add(story.storyName, () => story.component);
}
