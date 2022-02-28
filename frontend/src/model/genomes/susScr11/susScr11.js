import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("susScr11", [
    new Chromosome("chr1", 274330532),
    new Chromosome("chr2", 151935994),
    new Chromosome("chr3", 132848913),
    new Chromosome("chr4", 130910915),
    new Chromosome("chr5", 104526007),
    new Chromosome("chr6", 170843587),
    new Chromosome("chr7", 121844099),
    new Chromosome("chr8", 138966237),
    new Chromosome("chr9", 139512083),
    new Chromosome("chr10", 69359453),
    new Chromosome("chr11", 79169978),
    new Chromosome("chr12", 61602749),
    new Chromosome("chr13", 208334590),
    new Chromosome("chr14", 141755446),
    new Chromosome("chr15", 140412725),
    new Chromosome("chr16", 79944280),
    new Chromosome("chr17", 63494081),
    new Chromosome("chr18", 55982971),
    new Chromosome("chrM", 16613),
    new Chromosome("chrX", 125939595),
    new Chromosome("chrY", 43547828),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr18:45354081-45448655");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        label: "RefSeq genes",
        genome: "susScr11",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "susScr11",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/susScr11/rmsk16.bb",
    }),
];

const susScr11 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/susScr11/susScr11.2bit",
    annotationTracks,
};

export default susScr11;
