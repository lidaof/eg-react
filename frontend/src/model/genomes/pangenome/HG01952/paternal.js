import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./paternal_annotationTracks.json";

const genome = new Genome("HG01952-paternal", [
    new Chromosome("chr1", 239724378),
    new Chromosome("chr2", 242069839),
    new Chromosome("chr3", 202520110),
    new Chromosome("chr4", 191969088),
    new Chromosome("chr5", 183110826),
    new Chromosome("chr6", 171573150),
    new Chromosome("chr7", 161981322),
    new Chromosome("chr8", 145767929),
    new Chromosome("chr9", 133456781),
    new Chromosome("chr10", 134457957),
    new Chromosome("chr11", 134219478),
    new Chromosome("chr12", 133602044),
    new Chromosome("chr13", 108123661),
    new Chromosome("chr14", 98181845),
    new Chromosome("chr15", 90997179),
    new Chromosome("chr16", 96430674),
    new Chromosome("chr17", 82458128),
    new Chromosome("chr18", 79814236),
    new Chromosome("chr19", 61708640),
    new Chromosome("chr20", 66128247),
    new Chromosome("chr21", 36771125),
    new Chromosome("chr22", 49111489),
    new Chromosome("chrM", 16580),
    new Chromosome("chrY", 43884765),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG01952.paternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG01952PATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG01952_pat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG01952PATERNAL;
