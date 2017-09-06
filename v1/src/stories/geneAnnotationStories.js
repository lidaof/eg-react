import DisplayedRegionModel from '../model/DisplayedRegionModel';
import GeneAnnotationTrack from '../components/geneAnnotationTrack/GeneAnnotationTrack';
import GeneDataSource from '../dataSources/GeneDataSource';
import React from 'react';
//import SvgContainer from '../components/SvgContainer';
import { storiesOf } from '@storybook/react';

export const STORY_KIND = "Gene annotation"

const dataSource = new GeneDataSource();

const model = new DisplayedRegionModel("Wow very genome", [
    {name: "chr1", lengthInBases: 1000},
]);
model.setRegion(0, model.getGenomeLength());

export const geneAnnotationTest = {
    storyName: "Track",
    component: <GeneAnnotationTrack
        dataSource={dataSource}
        viewRegion={model}
        maxRows={2}
        yOffset={20}
    />
}
storiesOf(STORY_KIND, module)
    .add(geneAnnotationTest.storyName, () => geneAnnotationTest.component);
