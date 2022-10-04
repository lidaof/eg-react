import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./paternal_annotationTracks.json";

const genome = new Genome("HG00741-paternal", [
    new Chromosome("chr1", 251197394),
    new Chromosome("chr2", 242653281),
    new Chromosome("chr3", 200215533),
    new Chromosome("chr4", 190596957),
    new Chromosome("chr5", 182946383),
    new Chromosome("chr6", 172302625),
    new Chromosome("chr7", 161459651),
    new Chromosome("chr8", 148696930),
    new Chromosome("chr9", 141833813),
    new Chromosome("chr10", 135265895),
    new Chromosome("chr11", 134175857),
    new Chromosome("chr12", 133480218),
    new Chromosome("chr13", 99815423),
    new Chromosome("chr14", 101726264),
    new Chromosome("chr15", 90573660),
    new Chromosome("chr16", 88124214),
    new Chromosome("chr17", 83581939),
    new Chromosome("chr18", 78849119),
    new Chromosome("chr19", 61638809),
    new Chromosome("chr20", 66941460),
    new Chromosome("chr21", 46357128),
    new Chromosome("chr22", 45373385),
    new Chromosome("chrM", 16567),
    new Chromosome("chrX", 154240229),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG00741.paternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG00741PATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG00741_pat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG00741PATERNAL;
