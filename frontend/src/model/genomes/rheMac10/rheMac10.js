import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("rheMac10", [
    new Chromosome("chr1", 223616942),
    new Chromosome("chr2", 196197964),
    new Chromosome("chr3", 185288947),
    new Chromosome("chr4", 169963040),
    new Chromosome("chr5", 187317192),
    new Chromosome("chr6", 179085566),
    new Chromosome("chr7", 169868564),
    new Chromosome("chr8", 145679320),
    new Chromosome("chr9", 134124166),
    new Chromosome("chr10", 99517758),
    new Chromosome("chr11", 133066086),
    new Chromosome("chr12", 130043856),
    new Chromosome("chr13", 108737130),
    new Chromosome("chr14", 128056306),
    new Chromosome("chr15", 113283604),
    new Chromosome("chr16", 79627064),
    new Chromosome("chr17", 95433459),
    new Chromosome("chr18", 74474043),
    new Chromosome("chr19", 58315233),
    new Chromosome("chr20", 77137495),
    new Chromosome("chrM", 16564),
    new Chromosome("chrX", 153388924),
    new Chromosome("chrY", 11753682),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr3:87946311-88004460");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        label: "RefSeq genes",
        genome: "rheMac10",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "rheMac10",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/rheMac10/rmsk16.bb",
    }),
];

const rheMac10 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/rheMac10/rheMac10.2bit",
    annotationTracks,
};

export default rheMac10;
