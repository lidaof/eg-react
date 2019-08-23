import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("ce11", [
    new Chromosome("chrIII", 13783801),
    new Chromosome("chrII", 15279421),
    new Chromosome("chrIV", 17493829),
    new Chromosome("chrI", 15072434),
    new Chromosome("chrM", 13794),
    new Chromosome("chrV", 20924180),
    new Chromosome("chrX", 17718942),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chrII:14646376-14667875");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "ce11",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/ce11/rmsk16.bb',
    }),
];


const CE11 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/ce11/ce11.2bit",
    annotationTracks,
};

export default CE11;
