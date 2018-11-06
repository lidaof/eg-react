import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBand.json';
import annotationTracks from './annotationTracks.json';

const genome = new Genome("rn6", [
    new Chromosome("chr1", 282763074),
    new Chromosome("chr2", 266435125),
    new Chromosome("chr3", 177699992),
    new Chromosome("chr4", 184226339),
    new Chromosome("chr5", 173707219),
    new Chromosome("chr6", 147991367),
    new Chromosome("chr7", 145729302),
    new Chromosome("chr8", 133307652),
    new Chromosome("chr9", 122095297),
    new Chromosome("chr10", 112626471),
    new Chromosome("chr11", 90463843),
    new Chromosome("chr12", 52716770),
    new Chromosome("chr13", 114033958),
    new Chromosome("chr14", 115493446),
    new Chromosome("chr15", 111246239),
    new Chromosome("chr16", 90668790),
    new Chromosome("chr17", 90843779),
    new Chromosome("chr18", 88201929),
    new Chromosome("chr19", 62275575),
    new Chromosome("chr20", 56205956),
    new Chromosome("chrM", 16313),
    new Chromosome("chrX", 159970021),
    new Chromosome("chrY", 3310458),    
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52003276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "rn6",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/rn6/rmsk16.bb'
    }),
];

const rn6 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/rn6/rn6.2bit",
    annotationTracks,
};

export default rn6;
