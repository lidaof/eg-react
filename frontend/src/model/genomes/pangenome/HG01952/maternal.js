import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./maternal_annotationTracks.json";

const genome = new Genome("HG01952-maternal", [
    new Chromosome("chr1", 242383568),
    new Chromosome("chr2", 241932161),
    new Chromosome("chr3", 202441393),
    new Chromosome("chr4", 191589013),
    new Chromosome("chr5", 182623441),
    new Chromosome("chr6", 170585814),
    new Chromosome("chr7", 160943984),
    new Chromosome("chr8", 146295803),
    new Chromosome("chr9", 136645728),
    new Chromosome("chr10", 135953580),
    new Chromosome("chr11", 137907552),
    new Chromosome("chr12", 133174213),
    new Chromosome("chr13", 108374629),
    new Chromosome("chr14", 97392169),
    new Chromosome("chr15", 92494239),
    new Chromosome("chr16", 87872041),
    new Chromosome("chr17", 82813365),
    new Chromosome("chr18", 79512573),
    new Chromosome("chr19", 61099949),
    new Chromosome("chr20", 67263140),
    new Chromosome("chr21", 39438795),
    new Chromosome("chr22", 48405478),
    new Chromosome("chrM", 16580),
    new Chromosome("chrX", 154858800),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG01952.maternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG01952MATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG01952_mat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG01952MATERNAL;
