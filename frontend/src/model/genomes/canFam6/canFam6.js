import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";
const genome = new Genome("canFam6", [
    new Chromosome("chr1", 122014068),
    new Chromosome("chr2", 82037489),
    new Chromosome("chr3", 94329250),
    new Chromosome("chr4", 87912527),
    new Chromosome("chr5", 88913986),
    new Chromosome("chr6", 80213190),
    new Chromosome("chr7", 80419774),
    new Chromosome("chr8", 73585679),
    new Chromosome("chr9", 60315500),
    new Chromosome("chr10", 69219345),
    new Chromosome("chr11", 72832428),
    new Chromosome("chr12", 72300020),
    new Chromosome("chr13", 62895387),
    new Chromosome("chr14", 60430354),
    new Chromosome("chr15", 64389122),
    new Chromosome("chr16", 54556944),
    new Chromosome("chr17", 63738581),
    new Chromosome("chr18", 54357284),
    new Chromosome("chr19", 52989165),
    new Chromosome("chr20", 57984708),
    new Chromosome("chr21", 50232922),
    new Chromosome("chr22", 61822301),
    new Chromosome("chr23", 52413914),
    new Chromosome("chr24", 46832179),
    new Chromosome("chr25", 51908704),
    new Chromosome("chr26", 38725074),
    new Chromosome("chr27", 46280981),
    new Chromosome("chr28", 41264955),
    new Chromosome("chr29", 40893792),
    new Chromosome("chr30", 40067686),
    new Chromosome("chr31", 39086971),
    new Chromosome("chr32", 41857359),
    new Chromosome("chr33", 31422675),
    new Chromosome("chr34", 51113282),
    new Chromosome("chr35", 26040529),
    new Chromosome("chr36", 30723464),
    new Chromosome("chr37", 31754289),
    new Chromosome("chr38", 23973277),
    new Chromosome("chrM", 16727),
    new Chromosome("chrX", 108808365),
]);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr1:34702809-34709639");

const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiRefSeq",
        label: "NCBI genes",
        genome: "canFam6",
    }),
];

const canFam6 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/canFam6/canFam6.2bit",
    annotationTracks,
};

export default canFam6;
