import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("susScr3", [
    new Chromosome("chr1", 315321322),
    new Chromosome("chr2", 162569375),
    new Chromosome("chr3", 144787322),
    new Chromosome("chr4", 143465943),
    new Chromosome("chr5", 111506441),
    new Chromosome("chr6", 157765593),
    new Chromosome("chr7", 134764511),
    new Chromosome("chr8", 148491826),
    new Chromosome("chr9", 153670197),
    new Chromosome("chr10", 79102373),
    new Chromosome("chr11", 87690581),
    new Chromosome("chr12", 63588571),
    new Chromosome("chr13", 218635234),
    new Chromosome("chr14", 153851969),
    new Chromosome("chr15", 157681621),
    new Chromosome("chr16", 86898991),
    new Chromosome("chr17", 69701581),
    new Chromosome("chr18", 61220071),
    new Chromosome("chrM", 16613),
    new Chromosome("chrX", 144288218),
    new Chromosome("chrY", 1637716),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr18:50045452-50083338");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        label: "RefSeq genes",
        genome: "susScr3",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "susScr3",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/susScr3/rmsk16.bb",
    }),
];

const susScr3 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/susScr3/susScr3.2bit",
    annotationTracks,
};

export default susScr3;
