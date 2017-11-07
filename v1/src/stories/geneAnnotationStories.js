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
        chr: "chr1",
        start: 5,
        end: 100,
        details: `
            name2: "GENE1",
            strand: "+",
            struct: {
                thin: []
            },
            id: 1
        `
    }),
    new Gene({
        chr: "chr1",
        start: 200,
        end: 400,
        details: `
            name2: "GENE2",
            strand: "-",
            struct: {
                thin: [ [200, 250], [330, 400] ]
            },
            id: 2
        `
    }),
    new Gene({
        chr: "chr1",
        start: 250,
        end: 300,
        details: `
            name2: "GENE3",
            strand: "+",
            struct: {
                thick: []
            },
            id: 3
        `
    }),
    new Gene({
        chr: "chr1",
        start: 350,
        end: 500,
        details: `
            name2: "GENE4",
            strand: "-",
            struct: {
                thin: []
            },
            id: 4
        `
    }),
    new Gene({
        chr: "chr1",
        start: 800,
        end: 1200,
        details: `
            name2: "GENE5",
            strand: "+",
            struct: {
                thick: [ [900, 1100] ]
            },
            id: 5
        `
    })
];
for (let gene of DATA) {
    gene.setModel(model);
}

export const annotationStory = {
    storyName: "Annotations",
    component: <SvgContainer
        model={model}
    >
        <AnnotationArranger
            viewRegion={model}
            data={DATA}
            maxRows={2}
            yOffset={20}
        />
    </SvgContainer>
}

export const STORY_KIND = "Gene annotation";
let storyInterface = storiesOf(STORY_KIND, module);
storyInterface.add(annotationStory.storyName, () => annotationStory.component);
