import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("rn7", [
    new Chromosome("chr1", 260522016),
    new Chromosome("chr2", 249053267),
    new Chromosome("chr3", 169034231),
    new Chromosome("chr4", 182687754),
    new Chromosome("chr5", 166875058),
    new Chromosome("chr6", 140994061),
    new Chromosome("chr7", 135012528),
    new Chromosome("chr8", 123900184),
    new Chromosome("chr9", 114175309),
    new Chromosome("chr10", 107211142),
    new Chromosome("chr11", 86241447),
    new Chromosome("chr12", 46669029),
    new Chromosome("chr13", 106807694),
    new Chromosome("chr14", 104886043),
    new Chromosome("chr15", 101769107),
    new Chromosome("chr16", 84729064),
    new Chromosome("chr17", 86533673),
    new Chromosome("chr18", 83828827),
    new Chromosome("chr19", 57337602),
    new Chromosome("chr20", 54435887),
    new Chromosome("chrM", 16313),
    new Chromosome("chrX", 152453651),
    new Chromosome("chrY", 18315841),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr4:81250936-81263130");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        label: "RefSeq genes",
        genome: "rn7",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        genome: "rn7",
        label: "NCBI genes",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/rn7/rmsk16.bb",
    }),
];

const rn7 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/rn7/rn7.2bit",
    annotationTracks,
};

export default rn7;
