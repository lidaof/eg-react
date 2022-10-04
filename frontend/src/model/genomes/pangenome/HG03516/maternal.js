import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./maternal_annotationTracks.json";

const genome = new Genome("HG03516-maternal", [
    new Chromosome("chr1", 255734080),
    new Chromosome("chr2", 243015329),
    new Chromosome("chr3", 198805658),
    new Chromosome("chr4", 190765548),
    new Chromosome("chr5", 183032861),
    new Chromosome("chr6", 170693730),
    new Chromosome("chr7", 160335000),
    new Chromosome("chr8", 146640775),
    new Chromosome("chr9", 132455260),
    new Chromosome("chr10", 134345730),
    new Chromosome("chr11", 135000077),
    new Chromosome("chr12", 134233817),
    new Chromosome("chr13", 103136559),
    new Chromosome("chr14", 99220500),
    new Chromosome("chr15", 97307017),
    new Chromosome("chr16", 89153972),
    new Chromosome("chr17", 81851760),
    new Chromosome("chr18", 79141190),
    new Chromosome("chr19", 60775556),
    new Chromosome("chr20", 66704438),
    new Chromosome("chr21", 42241461),
    new Chromosome("chr22", 48144353),
    new Chromosome("chrM", 16571),
    new Chromosome("chrX", 153279079),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG03516.maternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG03516MATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG03516_mat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG03516MATERNAL;
