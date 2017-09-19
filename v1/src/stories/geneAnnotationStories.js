import AnnotationArranger from '../components/geneAnnotationTrack/AnnotationArranger';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import Gene from '../model/Gene';
import React from 'react';
import SvgContainer from '../components/SvgContainer';
import { storiesOf } from '@storybook/react';

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
        exons: [],
        id: 1
    }, model),
    new Gene({
        name: "GENE2",
        strand: "-",
        chromosome: "chr1",
        start: 200,
        end: 400,
        exons: [ [200, 250], [330, 400] ],
        id: 2
    }, model),
    new Gene({
        name: "GENE3",
        strand: "+",
        chromosome: "chr1",
        start: 250,
        end: 300,
        exons: [],
        id: 3
    }, model),
    new Gene({
        name: "GENE4",
        strand: "-",
        chromosome: "chr1",
        start: 350,
        end: 500,
        exons: [],
        id: 4
    }, model),
    new Gene({
        name: "GENE5",
        strand: "+",
        chromosome: "chr1",
        start: 800,
        end: 1200,
        exons: [ [900, 1100] ],
        id: 5
    }, model)
];

export const annotationStory = {
    storyName: "Annotations",
    component: <SvgContainer
        model={model}
    >
        <AnnotationArranger
            data={DATA}
            maxRows={2}
            yOffset={20}
        />
    </SvgContainer>
}

export const STORY_KIND = "Gene annotation";
let storyInterface = storiesOf(STORY_KIND, module);
storyInterface.add(annotationStory.storyName, () => annotationStory.component);
