import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("dm6", [
    new Chromosome("chr2L", 23513712),
    new Chromosome("chr2R", 25286936),
    new Chromosome("chr3L", 28110227),
    new Chromosome("chr3R", 32079331),
    new Chromosome("chr4", 1348131),
    new Chromosome("chrM", 19524),
    new Chromosome("chrX", 23542271),
    new Chromosome("chrY", 3667352),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr2L:826001-851000");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "dm6",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/dm6/rmsk16.bb",
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
        numTracks: 6,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/4dn/4dn-dm6-July2021.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "last update": "Jul 14 2021",
            "hub built notes": "metadata information are obtained directly from 4DN data portal",
        },
    },
];

const DM6 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/dm6/dm6.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default DM6;
