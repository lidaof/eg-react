import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

const genome = new Genome("COVID-19", [new Chromosome("NC_045512.2", 29903)]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("NC_045512.2:0-29903");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        genome: "COVID-19"
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler"
    }),
    new TrackModel({
        type: "bedgraph",
        name: "GC Percentage",
        url: "https://vizhub.wustl.edu/public/virus/ncov_CGpct.bedgraph.sort.gz"
    })
];

const annotationTracks = {
    Ruler: [
        {
            type: "ruler",
            label: "Ruler",
            name: "Ruler"
        }
    ],
    Genes: [
        {
            name: "ncbiGene",
            label: "NCBI genes",
            filetype: "geneAnnotation"
        }
    ],
    Assembly: [
        {
            type: "bedgraph",
            name: "GC Percentage",
            url: "https://vizhub.wustl.edu/public/virus/ncov_CGpct.bedgraph.sort.gz"
        }
    ]
};

const COVID19 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/virus/COVID-19.2bit",
    annotationTracks
};

export default COVID19;
