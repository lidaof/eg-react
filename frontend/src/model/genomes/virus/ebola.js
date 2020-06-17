import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

const genome = new Genome("Ebola", [new Chromosome("KM034562.1", 18957)]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("KM034562.1:0-18957");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "Ebola",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "bedgraph",
        name: "GC Percentage",
        url: "https://vizhub.wustl.edu/public/virus/ebola_CGpct.bedgraph.sort.gz",
    }),
    new TrackModel({
        type: "bedgraph",
        name: "Sequence diversity (Shannon Entropy)",
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/sme/ebola/diversity/ebola_entropy.bedgraph.sort.gz",
        options: {
            aggregateMethod: "MEAN",
        },
    }),
    new TrackModel({
        type: "qbed",
        name: "Mutation Alert",
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/sme/ebola/diversity/ebola_alert.bed.sort.gz",
        options: {
            height: 60,
            color: "darkgreen",
        },
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
    Assembly: [
        {
            type: "bedgraph",
            name: "GC Percentage",
            url: "https://vizhub.wustl.edu/public/virus/ebola_CGpct.bedgraph.sort.gz",
        },
    ],
    Diversity: [
        {
            type: "bedgraph",
            name: "Sequence diversity (Shannon Entropy)",
            url: "https://wangftp.wustl.edu/~cfan/viralBrowser/sme/ebola/diversity/ebola_entropy.bedgraph.sort.gz",
            options: {
                aggregateMethod: "MEAN",
            },
        },
        {
            type: "qbed",
            name: "Mutation Alert",
            url: "https://wangftp.wustl.edu/~cfan/viralBrowser/sme/ebola/diversity/ebola_alert.bed.sort.gz",
        },
    ],
};

const Ebola = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/virus/Ebola.2bit",
    annotationTracks,
};

export default Ebola;
