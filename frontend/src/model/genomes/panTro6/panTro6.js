import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBand.json";
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";

const allSize = chromSize.map((genom) => new Chromosome(genom.chr, genom.size));
const genome = new Genome("panTro6", allSize);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr7:27270738-27274218");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "panTro6",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/panTro6/panTro6.bb",
    }),
];

const PANTRO6 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/panTro6/panTro6.2bit",
    annotationTracks,
};

export default PANTRO6;
