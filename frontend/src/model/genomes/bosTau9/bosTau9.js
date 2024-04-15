import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("bosTau9", [
    new Chromosome("chr1", 158534110),
    new Chromosome("chr2", 136231102),
    new Chromosome("chr3", 121005158),
    new Chromosome("chr4", 120000601),
    new Chromosome("chr5", 120089316),
    new Chromosome("chr6", 117806340),
    new Chromosome("chr7", 110682743),
    new Chromosome("chr8", 113319770),
    new Chromosome("chr9", 105454467),
    new Chromosome("chr10", 103308737),
    new Chromosome("chr11", 106982474),
    new Chromosome("chr12", 87216183),
    new Chromosome("chr13", 83472345),
    new Chromosome("chr14", 82403003),
    new Chromosome("chr15", 85007780),
    new Chromosome("chr16", 81013979),
    new Chromosome("chr17", 73167244),
    new Chromosome("chr18", 65820629),
    new Chromosome("chr19", 63449741),
    new Chromosome("chr20", 71974595),
    new Chromosome("chr21", 69862954),
    new Chromosome("chr22", 60773035),
    new Chromosome("chr23", 52498615),
    new Chromosome("chr24", 62317253),
    new Chromosome("chr25", 42350435),
    new Chromosome("chr26", 51992305),
    new Chromosome("chr27", 45612108),
    new Chromosome("chr28", 45940150),
    new Chromosome("chr29", 51098607),
    new Chromosome("chrX", 139009144),
    new Chromosome("chrM", 16338),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr4:68843994-68890893");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiRefSeq",
        genome: "bosTau9",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/bosTau9/rmsk16.bb",
    }),
];

const BosTau9 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/bosTau9/bosTau9.2bit",
    annotationTracks,
};

export default BosTau9;
