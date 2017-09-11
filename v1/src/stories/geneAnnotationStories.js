import DisplayedRegionModel from '../model/DisplayedRegionModel';
import Gene from '../model/Gene';
import GeneAnnotationTrack from '../components/geneAnnotationTrack/GeneAnnotationTrack';
import DataSource from '../dataSources/DataSource';
import React from 'react';
//import SvgContainer from '../components/SvgContainer';
import { storiesOf } from '@storybook/react';

export const STORY_KIND = "Gene annotation";

const model = new DisplayedRegionModel("Wow very genome", [
    {name: "chr1", lengthInBases: 1500},
]);
model.setRegion(0, 1000);

const DATA = [
    new Gene({
        name: "GENE1",
        strand: "+",
        chromosome: "chr1",
        start: 5,
        end: 100,
        exons: []
    }, model),
    new Gene({
        name: "GENE2",
        strand: "-",
        chromosome: "chr1",
        start: 200,
        end: 400,
        exons: [ [200, 250], [330, 400] ]
    }, model),
    new Gene({
        name: "GENE3",
        strand: "+",
        chromosome: "chr1",
        start: 250,
        end: 300,
        exons: []
    }, model),
    new Gene({
        name: "GENE4",
        strand: "-",
        chromosome: "chr1",
        start: 350,
        end: 500,
        exons: []
    }, model),
    new Gene({
        name: "GENE5",
        strand: "+",
        chromosome: "chr1",
        start: 800,
        end: 1200,
        exons: [ [900, 1100] ]
    }, model)
];

class ConstDataSource extends DataSource {
    getData(regionModel) {
        return Promise.resolve(DATA);
    }
}

export const geneAnnotationTest = {
    storyName: "Track",
    component: <GeneAnnotationTrack
        dataSource={new ConstDataSource()}
        viewRegion={model}
        maxRows={2}
        yOffset={20}
    />
}
storiesOf(STORY_KIND, module)
    .add(geneAnnotationTest.storyName, () => geneAnnotationTest.component);
