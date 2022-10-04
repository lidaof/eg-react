import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./paternal_annotationTracks.json";

const genome = new Genome("HG03516-paternal", [
    new Chromosome("chr1", 252211044),
    new Chromosome("chr2", 241162074),
    new Chromosome("chr3", 200804039),
    new Chromosome("chr4", 192794284),
    new Chromosome("chr5", 188068542),
    new Chromosome("chr6", 171423035),
    new Chromosome("chr7", 160267159),
    new Chromosome("chr8", 145484181),
    new Chromosome("chr9", 143064001),
    new Chromosome("chr10", 134568832),
    new Chromosome("chr11", 134321688),
    new Chromosome("chr12", 134085869),
    new Chromosome("chr13", 111470812),
    new Chromosome("chr14", 96365175),
    new Chromosome("chr15", 94995732),
    new Chromosome("chr16", 92776298),
    new Chromosome("chr17", 83093696),
    new Chromosome("chr18", 80237413),
    new Chromosome("chr19", 61128810),
    new Chromosome("chr20", 66540046),
    new Chromosome("chr21", 38833159),
    new Chromosome("chr22", 51524212),
    new Chromosome("chrM", 16571),
    new Chromosome("chrX", 153819077),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG03516.paternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG03516PATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG03516_pat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG03516PATERNAL;
