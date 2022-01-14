import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("oviAri4", [
    new Chromosome("chr1", 275406953),
    new Chromosome("chr2", 248966461),
    new Chromosome("chr3", 223996068),
    new Chromosome("chr4", 119216639),
    new Chromosome("chr5", 107836144),
    new Chromosome("chr6", 116888256),
    new Chromosome("chr7", 100009711),
    new Chromosome("chr8", 90615088),
    new Chromosome("chr9", 94583238),
    new Chromosome("chr10", 86377204),
    new Chromosome("chr11", 62170480),
    new Chromosome("chr12", 79028859),
    new Chromosome("chr13", 82951069),
    new Chromosome("chr14", 62568341),
    new Chromosome("chr15", 80783214),
    new Chromosome("chr16", 71693149),
    new Chromosome("chr17", 72251135),
    new Chromosome("chr18", 68494538),
    new Chromosome("chr19", 60445663),
    new Chromosome("chr20", 51049468),
    new Chromosome("chr21", 49987992),
    new Chromosome("chr22", 50780147),
    new Chromosome("chr23", 62282865),
    new Chromosome("chr24", 41976827),
    new Chromosome("chr25", 45223504),
    new Chromosome("chr26", 44047080),
    new Chromosome("chrM", 16616),
    new Chromosome("chrX", 135185801),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr4:68723081-68936580");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        label: "RefSeq genes",
        genome: "oviAri4",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "oviAri4",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/oviAri4/rmsk16.bb",
    }),
];

const oviAri4 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/oviAri4/oviAri4.2bit",
    annotationTracks,
};

export default oviAri4;
