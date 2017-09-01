import DisplayedRegionModel from '../model/DisplayedRegionModel';
import GeneAnnotationSvg from '../components/GeneAnnotationSvg';
import React from 'react';
import SvgContainer from '../components/SvgContainer';
import { storiesOf } from '@storybook/react';

export const STORY_KIND = "Gene annotation"

const model = new DisplayedRegionModel("Wow very genome", [
    {name: "chr1", lengthInBases: 1000},
]);
model.setRegion(0, model.getGenomeLength());

const data = [
    {
        name: "GENE1",
        strand: "+",
        start: 5,
        end: 100,
        exons: []
    },
    {
        name: "GENE2",
        strand: "-",
        start: 200,
        end: 400,
        exons: [
            {
                start: 200,
                end: 250
            },
            {
                start: 330,
                end: 400
            }
        ]
    },
    {
        name: "GENE3",
        strand: "+",
        start: 250,
        end: 300,
        exons: []
    },
    {
        name: "GENE4",
        strand: "-",
        start: 350,
        end: 500,
        exons: []
    },
    {
        name: "GENE5",
        strand: "+",
        start: 800,
        end: 1200,
        exons: [
            {
                start: 900,
                end: 1100
            }
        ]
    },
]

export const geneAnnotationTest = {
    storyName: "SVG only",
    component: <SvgContainer>
        <GeneAnnotationSvg 
            data={data}
            model={model}
            maxRows={2}
            yOffset={20}
        />
    </SvgContainer>
}
storiesOf(STORY_KIND, module)
    .add(geneAnnotationTest.storyName, () => geneAnnotationTest.component);
