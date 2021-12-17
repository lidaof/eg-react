import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

const genome = new Genome("hpv16", [new Chromosome("NC_001526.4", 7906)]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("NC_001526.4:0-7906");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "hpv16",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
];

const annotationTracks = {
    Ruler: [
        {
            type: "ruler",
            label: "Ruler",
            name: "Ruler",
        },
    ],
    Genes: [
        {
            name: "ncbiGene",
            label: "NCBI genes",
            filetype: "geneAnnotation",
        },
    ],
};

const hpv16 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/virus/hpv16.2bit",
    annotationTracks,
};

export default hpv16;
