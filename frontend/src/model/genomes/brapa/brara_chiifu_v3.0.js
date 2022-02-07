import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("b_chiifu_v3", [
    new Chromosome("A01", 29595527),
    new Chromosome("A02", 31442979),
    new Chromosome("A03", 38154160),
    new Chromosome("A04", 21928416),
    new Chromosome("A05", 28493056),
    new Chromosome("A06", 29167992),
    new Chromosome("A07", 28928902),
    new Chromosome("A08", 22981702),
    new Chromosome("A09", 45156810),
    new Chromosome("A10", 20725698),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("A01:1187814-1197077");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "gene",
        label: "Brapa genes",
        genome: "b_chiifu_v3",
    }),
];

const BCHIIFUV3 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/b_chiifu_v3/b_chiifu_v3.2bit",
    annotationTracks,
};

export default BCHIIFUV3;
