import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("dm6", [
    new Chromosome("chr2L", 23513712),
    new Chromosome("chr2R", 25286936),
    new Chromosome("chr3L", 28110227),
    new Chromosome("chr3R", 32079331),
    new Chromosome("chr4", 1348131),
    new Chromosome("chrM", 19524),
    new Chromosome("chrX", 23542271),
    new Chromosome("chrY", 3667352),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr2L:826001-851000");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "dm6",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/dm6/rmsk16.bb',
    }),
];


const DM6 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/dm6/dm6.2bit",
    annotationTracks,
};

export default DM6;
