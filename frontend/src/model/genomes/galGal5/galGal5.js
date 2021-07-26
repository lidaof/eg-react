import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("galGal5", [
    new Chromosome("chr1", 196202544),
    new Chromosome("chr2", 149560735),
    new Chromosome("chr3", 111302122),
    new Chromosome("chr4", 91282656),
    new Chromosome("chr5", 59825302),
    new Chromosome("chr6", 35467016),
    new Chromosome("chr7", 36946936),
    new Chromosome("chr8", 29963013),
    new Chromosome("chr9", 24091566),
    new Chromosome("chr10", 20435342),
    new Chromosome("chr11", 20218793),
    new Chromosome("chr12", 19948154),
    new Chromosome("chr13", 18407460),
    new Chromosome("chr14", 15595052),
    new Chromosome("chr15", 12762846),
    new Chromosome("chr16", 652338),
    new Chromosome("chr17", 10956400),
    new Chromosome("chr18", 11053727),
    new Chromosome("chr19", 9979828),
    new Chromosome("chr20", 14109371),
    new Chromosome("chr21", 6862722),
    new Chromosome("chr22", 4729743),
    new Chromosome("chr23", 5786528),
    new Chromosome("chr24", 6280547),
    new Chromosome("chr25", 2906300),
    new Chromosome("chr26", 5313770),
    new Chromosome("chr27", 5655794),
    new Chromosome("chr28", 4974273),
    new Chromosome("chr30", 24927),
    new Chromosome("chr31", 49161),
    new Chromosome("chr32", 78254),
    new Chromosome("chr33", 1648031),
    new Chromosome("chrLGE64", 897576),
    new Chromosome("chrM", 16775),
    new Chromosome("chrW", 5160035),
    new Chromosome("chrZ", 82310166),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr2:32665920-32669380");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "galGal5",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/galGal5/rmsk16.bb",
    }),
];

const publicHubData = {
    "4D Nucleome Network":
        "The 4D Nucleome Network aims to understand the principles underlying nuclear " +
        "organization in space and time, the role nuclear organization plays in gene expression and cellular function, " +
        "and how changes in nuclear organization affect normal development as well as various diseases.  The program is " +
        "developing novel tools to explore the dynamic nuclear architecture and its role in gene expression programs, " +
        "models to examine the relationship between nuclear organization and function, and reference maps of nuclear" +
        "architecture in a variety of cells and tissues as a community resource.",
};

const publicHubList = [
    {
        collection: "4D Nucleome Network",
        name: "4DN datasets",
        numTracks: 103,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/4dn/4dn-galGal5-July2021.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "last update": "Jul 14 2021",
            "hub built notes": "metadata information are obtained directly from 4DN data portal",
        },
    },
];

const galGal5 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/galGal5/galGal5.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default galGal5;
