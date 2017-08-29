import Chromosomes from '../components/genomeNavSvg/Chromosomes';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import React from 'react';
import Ruler from '../components/genomeNavSvg/Ruler';
import SelectionBox from '../components/genomeNavSvg/SelectionBox';
import SingleSvgRender from './SingleSvgRender';
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
    component: <SingleSvgRender childClass={Chromosomes} childProps={{model: model}} />,
};
STORIES.push(chromosomeTest);

export const rulerTest = {
    storyName: "Ruler",
    component: <SingleSvgRender childClass={Ruler} childProps={{model: model, yOffset: 40}} />,
}
STORIES.push(rulerTest);

export const selectBoxTest = {
    storyName: "Selection box",
    component: <SingleSvgRender
        childClass={SelectionBox}
        childProps={{
            model: model,
            regionSelectedCallback: (start, end) => {window.newRegion = {start: start, end: end}},
            yOffset: 20,
        }}
    />,
};
STORIES.push(selectBoxTest);

let storyInterface = storiesOf(STORY_KIND, module);
for (let story of STORIES) {
    storyInterface.add(story.storyName, () => story.component);
}
