import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("xenTro10", [
    new Chromosome("chr1", 217471166),
    new Chromosome("chr2", 181034961),
    new Chromosome("chr3", 153873357),
    new Chromosome("chr4", 153961319),
    new Chromosome("chr5", 164033575),
    new Chromosome("chr6", 154486312),
    new Chromosome("chr7", 133565930),
    new Chromosome("chr8", 147241510),
    new Chromosome("chr9", 91218944),
    new Chromosome("chr10", 52432566),
    new Chromosome("chrM", 17610),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:42132108-42175007");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "xenTro10",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "ncbi Genes",
        genome: "xenTro10",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/xenTro10/rmsk16.bb",
    }),
];

const xenTro10 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/xenTro10/xenTro10.2bit",
    annotationTracks,
};

export default xenTro10;
