import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";

const allSize = chromSize.map((genom) => new Chromosome(genom.chr, genom.size));
const genome = new Genome("phaw5", allSize);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("phaw_50.000135b:538531-1003670");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "gene",
        genome: "phaw5",
        options: {
            maxRows: 10,
        },
    }),
];

const phaw5 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/phaw5/phaw5.2bit",
    annotationTracks,
};

export default phaw5;
