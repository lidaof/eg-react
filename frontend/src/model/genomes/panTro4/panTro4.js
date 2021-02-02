import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';

import annotationTracks from "./annotationTracks.json";

const genome = new Genome("panTro4", [
    new Chromosome("chr1", 228333871),
    new Chromosome("chr2A", 113622374),
    new Chromosome("chr2B", 247518478),
    new Chromosome("chr3", 202329955),
    new Chromosome("chr4", 193495092),
    new Chromosome("chr5", 182651097),
    new Chromosome("chr6", 172623881),
    new Chromosome("chr7", 161824586),
    new Chromosome("chr8", 143986469),
    new Chromosome("chr9", 137840987),
    new Chromosome("chr10", 133524379),
    new Chromosome("chr11", 133121534),
    new Chromosome("chr12", 134246214),
    new Chromosome("chr13", 115123233),
    new Chromosome("chr14", 106544938),
    new Chromosome("chr15", 99548318),
    new Chromosome("chr16", 89983829),
    new Chromosome("chr17", 82630442),
    new Chromosome("chr18", 76611499),
    new Chromosome("chr19", 63644993),
    new Chromosome("chr20", 61729293),
    new Chromosome("chr21", 32799110),
    new Chromosome("chr22", 49737984),
    new Chromosome("chrM", 16554),
    new Chromosome("chrX", 156848144),
    new Chromosome("chrY", 26342871),
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
        name: "refGene",
        label: "refGenes",
        genome: 'panTro4'
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ensGene",
        label: "ensembl genes",
        genome: 'panTro4'
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/panTro4/panTro4_rmsk.bb',
    })
];

const PANTRO4 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/panTro4/panTro4.2bit",
    annotationTracks,
};

export default PANTRO4;
