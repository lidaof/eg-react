import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("bosTau8", [
    new Chromosome("chr1", 158337067),
    new Chromosome("chr2", 137060424),
    new Chromosome("chr3", 121430405),
    new Chromosome("chr4", 120829699),
    new Chromosome("chr5", 121191424),
    new Chromosome("chr6", 119458736),
    new Chromosome("chr7", 112638659),
    new Chromosome("chr8", 113384836),
    new Chromosome("chr9", 105708250),
    new Chromosome("chr10", 104305016),
    new Chromosome("chr11", 107310763),
    new Chromosome("chr12", 91163125),
    new Chromosome("chr13", 84240350),
    new Chromosome("chr14", 84648390),
    new Chromosome("chr15", 85296676),
    new Chromosome("chr16", 81724687),
    new Chromosome("chr17", 75158596),
    new Chromosome("chr18", 66004023),
    new Chromosome("chr19", 64057457),
    new Chromosome("chr20", 72042655),
    new Chromosome("chr21", 71599096),
    new Chromosome("chr22", 61435874),
    new Chromosome("chr23", 52530062),
    new Chromosome("chr24", 62714930),
    new Chromosome("chr25", 42904170),
    new Chromosome("chr26", 51681464),
    new Chromosome("chr27", 45407902),
    new Chromosome("chr28", 46312546),
    new Chromosome("chr29", 51505224),
    new Chromosome("chrX", 148823899),
    new Chromosome("chrM", 16338),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52425276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "bosTau8",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/bosTau8/rmsk16.bb',
    }),
];


const BosTau8 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/bosTau8/bosTau8.2bit",
    annotationTracks,
};

export default BosTau8;
