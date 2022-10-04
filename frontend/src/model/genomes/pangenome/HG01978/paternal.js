import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./paternal_annotationTracks.json";

const genome = new Genome("HG01978-paternal", [
    new Chromosome("chr1", 253244004),
    new Chromosome("chr2", 242206754),
    new Chromosome("chr3", 201803622),
    new Chromosome("chr4", 190741131),
    new Chromosome("chr5", 184051299),
    new Chromosome("chr6", 171765366),
    new Chromosome("chr7", 158936985),
    new Chromosome("chr8", 144934948),
    new Chromosome("chr9", 139146760),
    new Chromosome("chr10", 141339024),
    new Chromosome("chr11", 135191925),
    new Chromosome("chr12", 133193803),
    new Chromosome("chr13", 103734069),
    new Chromosome("chr14", 100861925),
    new Chromosome("chr15", 92404395),
    new Chromosome("chr16", 93031152),
    new Chromosome("chr17", 82734940),
    new Chromosome("chr18", 80378181),
    new Chromosome("chr19", 60275999),
    new Chromosome("chr20", 67483369),
    new Chromosome("chr21", 42950394),
    new Chromosome("chr22", 49110347),
    new Chromosome("chrM", 16571),
    new Chromosome("chrX", 155191605),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG01978.paternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG01978PATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG01978_pat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG01978PATERNAL;
