import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./paternal_annotationTracks.json";

const genome = new Genome("HG00621-paternal", [
    new Chromosome("chr1", 246001623),
    new Chromosome("chr2", 242812627),
    new Chromosome("chr3", 199951303),
    new Chromosome("chr4", 191801317),
    new Chromosome("chr5", 181679540),
    new Chromosome("chr6", 171942837),
    new Chromosome("chr7", 160918042),
    new Chromosome("chr8", 145720592),
    new Chromosome("chr9", 137589966),
    new Chromosome("chr10", 135267190),
    new Chromosome("chr11", 134903717),
    new Chromosome("chr12", 133243657),
    new Chromosome("chr13", 104817161),
    new Chromosome("chr14", 99536588),
    new Chromosome("chr15", 93447009),
    new Chromosome("chr16", 86854207),
    new Chromosome("chr17", 82118990),
    new Chromosome("chr18", 78615105),
    new Chromosome("chr19", 61580937),
    new Chromosome("chr20", 67254825),
    new Chromosome("chr21", 39736513),
    new Chromosome("chr22", 45699432),
    new Chromosome("chrM", 16570),
    new Chromosome("chrY", 42477659),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG00621.paternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG00621PATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG00621_pat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG00621PATERNAL;
