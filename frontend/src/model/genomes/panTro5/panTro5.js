import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from './annotationTracks.json';

const genome = new Genome("panTro5", [
    new Chromosome("chr1", 228573443),
    new Chromosome("chr3", 202621043),
    new Chromosome("chr2A", 111504155),
    new Chromosome("chr2B", 133216015),
    new Chromosome("chr4", 194502333),
    new Chromosome("chr5", 181907262),
    new Chromosome("chr6", 175400573),
    new Chromosome("chr7", 166211670),
    new Chromosome("chr8", 147911612),
    new Chromosome("chr9", 116767853),
    new Chromosome("chr10", 135926727),
    new Chromosome("chr11", 135753878),
    new Chromosome("chr12", 137163284),
    new Chromosome("chr13", 100452976),
    new Chromosome("chr14", 91965084),
    new Chromosome("chr15", 83230942),
    new Chromosome("chr16", 81586097),
    new Chromosome("chr17", 83181570),
    new Chromosome("chr18", 78221452),
    new Chromosome("chr19", 61309027),
    new Chromosome("chr20", 66533130),
    new Chromosome("chr21", 33445071),
    new Chromosome("chr22", 37823149),
    new Chromosome("chrX", 155549662),
    new Chromosome("chrY", 26350515),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52003276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "panTro5",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/panTro5/rmsk16.bb'
    }),
];

const PANTRO5 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/panTro5/panTro5.2bit",
    annotationTracks,
};

export default PANTRO5;
