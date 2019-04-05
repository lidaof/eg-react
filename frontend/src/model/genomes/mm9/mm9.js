import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("mm9", [
    new Chromosome("chr1", 197195432),
    new Chromosome("chr2", 181748087),
    new Chromosome("chr3", 159599783),
    new Chromosome("chr4", 155630120),
    new Chromosome("chr5", 152537259),
    new Chromosome("chr6", 149517037),
    new Chromosome("chr7", 152524553),
    new Chromosome("chr8", 131738871),
    new Chromosome("chr9", 124076172),
    new Chromosome("chr10", 129993255),
    new Chromosome("chr11", 121843856),
    new Chromosome("chr12", 121257530),
    new Chromosome("chr13", 120284312),
    new Chromosome("chr14", 125194864),
    new Chromosome("chr15", 103494974),
    new Chromosome("chr16", 98319150),
    new Chromosome("chr17", 95272651),
    new Chromosome("chr18", 90772031),
    new Chromosome("chr19", 61342430),
    new Chromosome("chrX", 166650296),
    new Chromosome("chrY", 15902555),
    new Chromosome("chrM", 16299),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52425276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "mm9",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/mm9/rmsk16.bb',
    }),
];


const MM9 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/mm9/mm9.2bit",
    annotationTracks,
};

export default MM9;
