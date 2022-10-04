import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./paternal_annotationTracks.json";

const genome = new Genome("HG002-paternal", [
    new Chromosome("chr1", 252114745),
    new Chromosome("chr2", 242054856),
    new Chromosome("chr3", 199186228),
    new Chromosome("chr4", 192250309),
    new Chromosome("chr5", 182574178),
    new Chromosome("chr6", 172635743),
    new Chromosome("chr7", 159878589),
    new Chromosome("chr8", 146747882),
    new Chromosome("chr9", 143797991),
    new Chromosome("chr10", 138952756),
    new Chromosome("chr11", 133781676),
    new Chromosome("chr12", 133595000),
    new Chromosome("chr13", 111502864),
    new Chromosome("chr14", 98510794),
    new Chromosome("chr15", 90339852),
    new Chromosome("chr16", 90453210),
    new Chromosome("chr17", 82545514),
    new Chromosome("chr18", 78934485),
    new Chromosome("chr19", 61160173),
    new Chromosome("chr20", 66421192),
    new Chromosome("chr21", 34296955),
    new Chromosome("chr22", 40413461),
    new Chromosome("chrM", 16569),
    new Chromosome("chrY", 46419591),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52149465-52164219");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "refbed",
        name: "lifted gencode v29",
        url: "https://vizhub.wustl.edu/public/pangenome/HG002.paternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG002PATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG002_pat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG002PATERNAL;
