import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./maternal_annotationTracks.json";

const genome = new Genome("HG01978-maternal", [
    new Chromosome("chr1", 255870459),
    new Chromosome("chr2", 242049113),
    new Chromosome("chr3", 199413651),
    new Chromosome("chr4", 190998200),
    new Chromosome("chr5", 184130405),
    new Chromosome("chr6", 171867230),
    new Chromosome("chr7", 160496716),
    new Chromosome("chr8", 146026493),
    new Chromosome("chr9", 150564281),
    new Chromosome("chr10", 137104475),
    new Chromosome("chr11", 137974552),
    new Chromosome("chr12", 132258079),
    new Chromosome("chr13", 104643890),
    new Chromosome("chr14", 100319898),
    new Chromosome("chr15", 98164420),
    new Chromosome("chr16", 93007668),
    new Chromosome("chr17", 82794654),
    new Chromosome("chr18", 80361482),
    new Chromosome("chr19", 62173746),
    new Chromosome("chr20", 66244013),
    new Chromosome("chr21", 38982770),
    new Chromosome("chr22", 44458059),
    new Chromosome("chrM", 16571),
    new Chromosome("chrX", 154765506),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG01978.maternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG01978MATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG01978_mat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG01978MATERNAL;
