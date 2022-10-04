import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./maternal_annotationTracks.json";

const genome = new Genome("HG00621-maternal", [
    new Chromosome("chr1", 248104460),
    new Chromosome("chr2", 242473427),
    new Chromosome("chr3", 200634999),
    new Chromosome("chr4", 191286151),
    new Chromosome("chr5", 181985206),
    new Chromosome("chr6", 171087124),
    new Chromosome("chr7", 161296153),
    new Chromosome("chr8", 145080769),
    new Chromosome("chr9", 142975514),
    new Chromosome("chr10", 134824617),
    new Chromosome("chr11", 135151470),
    new Chromosome("chr12", 134169535),
    new Chromosome("chr13", 102873273),
    new Chromosome("chr14", 94407008),
    new Chromosome("chr15", 95498866),
    new Chromosome("chr16", 86662381),
    new Chromosome("chr17", 82342693),
    new Chromosome("chr18", 78172853),
    new Chromosome("chr19", 61507476),
    new Chromosome("chr20", 64048424),
    new Chromosome("chr21", 39376202),
    new Chromosome("chr22", 49601413),
    new Chromosome("chrM", 16570),
    new Chromosome("chrX", 154694533),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG00621.maternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG00621MATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG00621_mat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG00621MATERNAL;
