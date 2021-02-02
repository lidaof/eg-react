import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("sacCer3", [
    new Chromosome("chrI", 230218),
    new Chromosome("chrII", 813184),
    new Chromosome("chrIII", 316620),
    new Chromosome("chrIV", 1531933),
    new Chromosome("chrV", 576874),
    new Chromosome("chrVI", 270161),
    new Chromosome("chrVII", 1090940),
    new Chromosome("chrVIII", 562643),
    new Chromosome("chrIX", 439888),
    new Chromosome("chrX", 745751),
    new Chromosome("chrXI", 666816),
    new Chromosome("chrXII", 1078177),
    new Chromosome("chrXIII", 924431),
    new Chromosome("chrXIV", 784333),
    new Chromosome("chrXV", 1091291),
    new Chromosome("chrXVI", 948066),
    new Chromosome("chrM", 85779)
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chrII:235244-243590");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "sgdGene",
        genome: "sacCer3"
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler"
    })
];

const sacCer3 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/sacCer3/sacCer3.2bit",
    annotationTracks
};

export default sacCer3;
