import React from 'react';
import { storiesOf } from '@storybook/react';

import SvgContainer from '../components/SvgContainer';
import AnnotationArranger from '../components/geneAnnotationTrack/AnnotationArranger';

import Feature from '../model/Feature';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import NavigationContext from '../model/NavigationContext';
import Gene from '../model/Gene';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import FeatureInterval from '../model/interval/FeatureInterval';

const CHR1 = new Feature("chr1", new ChromosomeInterval("chr1", 0, 1500));
const NAV_CONTEXT = new NavigationContext("Wow very genome", [CHR1]);
const model = new DisplayedRegionModel(NAV_CONTEXT, 0, 1000);

const RECORDS = [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    }
];

const GENES = RECORDS.map(record =>
    new Gene(record, model.getNavigationContext(), new FeatureInterval(CHR1, 0, CHR1.getLength()))
);

export const annotationStory = {
    storyName: "Annotations",
    component: <SvgContainer
        model={model}
    >
        <AnnotationArranger
            viewRegion={model}
            data={GENES}
            maxRows={2}
            yOffset={20}
        />
    </SvgContainer>
}

export const STORY_KIND = "Gene annotation";
let storyInterface = storiesOf(STORY_KIND, module);
storyInterface.add(annotationStory.storyName, () => annotationStory.component);
