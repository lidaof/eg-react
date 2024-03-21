import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBand.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("rn5", [
    new Chromosome("chr1", 290094216),
    new Chromosome("chr2", 285068071),
    new Chromosome("chr3", 183740530),
    new Chromosome("chr4", 248343840),
    new Chromosome("chr5", 177180328),
    new Chromosome("chr6", 156897508),
    new Chromosome("chr7", 143501887),
    new Chromosome("chr8", 132457389),
    new Chromosome("chr9", 121549591),
    new Chromosome("chr10", 112200500),
    new Chromosome("chr11", 93518069),
    new Chromosome("chr12", 54450796),
    new Chromosome("chr13", 118718031),
    new Chromosome("chr14", 115151701),
    new Chromosome("chr15", 114627140),
    new Chromosome("chr16", 90051983),
    new Chromosome("chr17", 92503511),
    new Chromosome("chr18", 87229863),
    new Chromosome("chr19", 72914587),
    new Chromosome("chr20", 57791882),
    new Chromosome("chrM", 16313),
    new Chromosome("chrX", 154597545),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr4:146956394-146974708");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "rn5",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/rn5/rmsk16.bb",
    }),
];

const rn5 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/rn5/rn5.2bit",
    annotationTracks,
};

export default rn5;
