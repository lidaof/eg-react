import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("calJac4", [
    new Chromosome("chr1", 217961735),
    new Chromosome("chr2", 204486479),
    new Chromosome("chr3", 191910223),
    new Chromosome("chr4", 174041770),
    new Chromosome("chr5", 164351765),
    new Chromosome("chr6", 161003406),
    new Chromosome("chr7", 157546058),
    new Chromosome("chr8", 126850804),
    new Chromosome("chr9", 134044658),
    new Chromosome("chr10", 137671225),
    new Chromosome("chr11", 129688756),
    new Chromosome("chr12", 124486764),
    new Chromosome("chr13", 118934817),
    new Chromosome("chr14", 112090317),
    new Chromosome("chr15", 99198953),
    new Chromosome("chr16", 97817134),
    new Chromosome("chr17", 74942703),
    new Chromosome("chr18", 47031477),
    new Chromosome("chr19", 51570929),
    new Chromosome("chr20", 45615054),
    new Chromosome("chr21", 51259342),
    new Chromosome("chr22", 51300780),
    new Chromosome("chrM", 16499),
    new Chromosome("chrX", 148168104),
    new Chromosome("chrY", 8228174),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr8:28982644-29067973");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "calJac4",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/calJac4/rmsk16.bb",
    }),
];

const calJac4 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/calJac4/calJac4.2bit",
    annotationTracks,
};

export default calJac4;
