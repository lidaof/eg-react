import Chromosomes from '../components/genomeNavSvg/Chromosomes';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import React from 'react';
import Ruler from '../components/genomeNavSvg/Ruler';
import SingleSvgRender from './SingleSvgRender';
import { storiesOf } from '@storybook/react';

const MODEL = new DisplayedRegionModel("Wow very genome", [
    {name: "chr1", lengthInBases: 1500},
    {name: "chr2", lengthInBases: 2500},
    {name: "chr3", lengthInBases: 3500},
]);
MODEL.setRegion(1, 7500);

export const STORY_KIND = "Genome navigator";

export const ChromosomeTest = {
    storyName: "Chromosomes",
    component: <SingleSvgRender childClass={Chromosomes} childProps={{model: MODEL}} />
};
storiesOf(STORY_KIND, module)
    .add(ChromosomeTest.storyName, () => ChromosomeTest.component);

export const RulerTest = {
    storyName: "Ruler",
    component: <SingleSvgRender childClass={Ruler} childProps={{model: MODEL, yOffset: 40}} />
};
storiesOf(STORY_KIND, module)
    .add(RulerTest.storyName, () => RulerTest.component);
