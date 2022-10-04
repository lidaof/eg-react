import Chromosome from "../../Chromosome";
import Genome from "../../Genome";
import TrackModel from "../../../TrackModel";
import annotationTracks from "./maternal_annotationTracks.json";

const genome = new Genome("HG002-maternal", [
    new Chromosome("chr1", 251946536),
    new Chromosome("chr2", 241746906),
    new Chromosome("chr3", 199578765),
    new Chromosome("chr4", 191279209),
    new Chromosome("chr5", 183032113),
    new Chromosome("chr6", 171862164),
    new Chromosome("chr7", 162676710),
    new Chromosome("chr8", 146162179),
    new Chromosome("chr9", 141979676),
    new Chromosome("chr10", 135528973),
    new Chromosome("chr11", 135195801),
    new Chromosome("chr12", 133364668),
    new Chromosome("chr13", 100338668),
    new Chromosome("chr14", 98523326),
    new Chromosome("chr15", 92495150),
    new Chromosome("chr16", 90263977),
    new Chromosome("chr17", 82660987),
    new Chromosome("chr18", 78244856),
    new Chromosome("chr19", 61306886),
    new Chromosome("chr20", 66061391),
    new Chromosome("chr21", 38859244),
    new Chromosome("chr22", 43165484),
    new Chromosome("chrX", 154412560),
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
        url: "https://vizhub.wustl.edu/public/pangenome/HG002.maternal.refbed.gz",
    }),
];

const publicHubData = {};

const publicHubList = [];

const HG002MATERNAL = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/pangenome/HG002_mat.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG002MATERNAL;
