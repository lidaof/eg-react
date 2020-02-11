import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

const genome = new Genome("SARS", [new Chromosome("NC_004718.3", 29751)]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("NC_004718.3:0-29751");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        genome: "SARS"
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler"
    }),
    new TrackModel({
        type: "bedgraph",
        name: "GC Percentage",
        url: "https://vizhub.wustl.edu/public/virus/sars_CGpct.bedgraph.sort.gz	"
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
            url: "https://vizhub.wustl.edu/public/virus/sars_CGpct.bedgraph.sort.gz	"
        }
    ],
    "Genome Comparison": [
        {
            name: "codiv19tosars",
            label: "COVID-19 to SARS alignment",
            querygenome: "COVID-19",
            filetype: "genomealign",
            url: "https://vizhub.wustl.edu/public/virus/sars_ncov.genomealign.gz"
        },
        {
            name: "merstosars",
            label: "MERS to SARS alignment",
            querygenome: "MERS",
            filetype: "genomealign",
            url: "https://vizhub.wustl.edu/public/virus/sars_mers.genomealign.gz"
        }
    ]
};

const SARS = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/virus/SARS.2bit",
    annotationTracks
};

export default SARS;
