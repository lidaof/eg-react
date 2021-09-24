import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import annotationTracks from "./annotationTracks.json";

const genomeName = "t2t-chm13-v1.1";

const genome = new Genome(genomeName, [
    new Chromosome("chr1", 248387328),
    new Chromosome("chr2", 242696752),
    new Chromosome("chr3", 201105948),
    new Chromosome("chr4", 193574945),
    new Chromosome("chr5", 182045439),
    new Chromosome("chr6", 172126628),
    new Chromosome("chr7", 160567428),
    new Chromosome("chr8", 146259331),
    new Chromosome("chr9", 150617247),
    new Chromosome("chr10", 134758134),
    new Chromosome("chr11", 135127769),
    new Chromosome("chr12", 133324548),
    new Chromosome("chr13", 113566686),
    new Chromosome("chr14", 101161492),
    new Chromosome("chr15", 99753195),
    new Chromosome("chr16", 96330374),
    new Chromosome("chr17", 84276897),
    new Chromosome("chr18", 80542538),
    new Chromosome("chr19", 61707364),
    new Chromosome("chr20", 66210255),
    new Chromosome("chr21", 45090682),
    new Chromosome("chr22", 51324926),
    new Chromosome("chrX", 154259566),
    new Chromosome("chrM", 16569),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr7:27203153-27363337");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "genes",
        label: "genes from CAT and Liftoff",
        genome: genomeName,
        options: {
            maxRows: 10,
        },
    }),
    new TrackModel({
        type: "rmskv2",
        name: "RepeatMaskerV2",
        url: "https://vizhub.wustl.edu/public/t2t-chm13-v1.1/rmsk.bigBed",
    }),
];

const CHM13v1_1 = {
    genome,
    navContext,
    cytobands: {},
    defaultRegion,
    defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/t2t-chm13-v1.1/t2t-chm13-v1.1.2bit",
    annotationTracks,
};

export default CHM13v1_1;
