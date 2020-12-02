import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';

import annotationTracks from "./annotationTracks.json";

const genome = new Genome("calJac3", [
    new Chromosome("chr1", 210400635),
    new Chromosome("chr2", 204313951),
    new Chromosome("chr3", 190850796),
    new Chromosome("chr4", 171630274),
    new Chromosome("chr5", 159171411),
    new Chromosome("chr6", 158406734),
    new Chromosome("chr7", 155834243),
    new Chromosome("chr8", 128169293),
    new Chromosome("chr9", 124281992),
    new Chromosome("chr10", 132174527),
    new Chromosome("chr11", 130397257),
    new Chromosome("chr12", 121768101),
    new Chromosome("chr13", 117903854),
    new Chromosome("chr14", 108792865),
    new Chromosome("chr15", 98464013),
    new Chromosome("chr16", 96796970),
    new Chromosome("chr17", 74750902),
    new Chromosome("chr18", 47448759),
    new Chromosome("chr19", 49578535),
    new Chromosome("chr20", 44557958),
    new Chromosome("chr21", 50472720),
    new Chromosome("chr22", 49145316),
    new Chromosome("chrX", 142054208),
    new Chromosome("chrY", 2853901)
]);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52425276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "ncbi Genes",
        genome: 'calJac3'
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ensGene",
        label: "ensembl genes",
        genome: 'calJac3'
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/calJac3/calJac3_rmsk.bb',
    })
];

const CALJAC3 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/calJac3/calJac3.2bit",
    annotationTracks,
};

export default CALJAC3;
