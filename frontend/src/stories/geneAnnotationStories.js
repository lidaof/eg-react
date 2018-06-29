/*
import React from 'react';
import { storiesOf } from '@storybook/react';

import withAutoDimensions from '../components/withAutoDimensions';

import Feature from '../model/Feature';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import NavigationContext from '../model/NavigationContext';
import Gene from '../model/Gene';
import ChromosomeInterval from '../model/interval/ChromosomeInterval';
import { FeatureSegment } from '../model/interval/FeatureSegment';
import RegionExpander from '../model/RegionExpander';
import LinearDrawingModel from '../model/LinearDrawingModel';

const CHR1 = new Feature("chr1", new ChromosomeInterval("chr1", 0, 1500));
const NAV_CONTEXT = new NavigationContext("Wow very genome", [CHR1]);
const VIEW_REGION = new DisplayedRegionModel(NAV_CONTEXT, 0, 1000);

const RECORDS = [
    {
        chrom: "chr1",
        txStart: 5,
        txEnd: 100,
        cdsStart: 5,
        cdsEnd: 100,
        name2: "GENE1",
        strand: "+",
        _id: 1,
    },
    {
        chrom: "chr1",
        txStart: 200,
        txEnd: 400,
        cdsStart: 250,
        cdsEnd: 330,
        name2: "GENE2",
        strand: "-",
        _id: 2,
    },
    {
        chrom: "chr1",
        txStart: 250,
        txEnd: 300,
        cdsStart: 250,
        cdsEnd: 300,
        name2: "GENE3",
        strand: "+",
        _id: 3,
    },
    {
        chrom: "chr1",
        txStart: 350,
        txEnd: 500,
        cdsStart: 350,
        cdsEnd: 500,
        name2: "GENE4",
        strand: "-",
        _id: 4,
    },
    {
        chrom: "chr1",
        txStart: 800,
        txEnd: 1200,
        cdsStart: 830,
        cdsEnd: 1100,
        exonStarts: "830,920,",
        exonEnds: "890,1100,",
        name2: "GENE5",
        strand: "+",
        _id: 5,
    }
];

const GENES = RECORDS.map(record => new Gene(record));

function Renderer(props) {
    const drawModel = new LinearDrawingModel(VIEW_REGION, props.width);
    return <svg width="100%">
        <AnnotationArranger viewRegion={VIEW_REGION} drawModel={drawModel} data={GENES}  options={{rows: 2}} />
    </svg>;
}
const AutoWidthRenderer = withAutoDimensions(Renderer);

export const annotationStory = {
    storyName: "Annotations",
    element: <AutoWidthRenderer />
};

export const STORY_KIND = "Gene annotation";
let storyInterface = storiesOf(STORY_KIND, module);
storyInterface.add(annotationStory.storyName, () => annotationStory.element);
*/