import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./maternal_annotationTracks.json";

const genome = new Genome("HG00741-maternal", [
    new Chromosome("chr1", 250492167),
    new Chromosome("chr2", 242197620),
    new Chromosome("chr3", 201980051),
    new Chromosome("chr4", 193025806),
    new Chromosome("chr5", 182833037),
    new Chromosome("chr6", 173117630),
    new Chromosome("chr7", 160799653),
    new Chromosome("chr8", 146193569),
    new Chromosome("chr9", 142544088),
    new Chromosome("chr10", 134456678),
    new Chromosome("chr11", 134310046),
    new Chromosome("chr12", 133354313),
    new Chromosome("chr13", 102647652),
    new Chromosome("chr14", 102292784),
    new Chromosome("chr15", 99711611),
    new Chromosome("chr16", 93045737),
    new Chromosome("chr17", 82950426),
    new Chromosome("chr18", 79852462),
    new Chromosome("chr19", 61306904),
    new Chromosome("chr20", 65547825),
    new Chromosome("chr21", 45041411),
    new Chromosome("chr22", 44777556),
    new Chromosome("chrM", 16567),
    new Chromosome("chrX", 154314383),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG00741.maternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG00741MATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG00741_mat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG00741MATERNAL;
