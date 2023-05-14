import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("GRCg7w", [
    new Chromosome("1", 196242913),
    new Chromosome("2", 149940142),
    new Chromosome("3", 110406817),
    new Chromosome("4", 90563926),
    new Chromosome("5", 59353219),
    new Chromosome("6", 36041924),
    new Chromosome("7", 36265832),
    new Chromosome("8", 29567511),
    new Chromosome("9", 23494135),
    new Chromosome("10", 20321356),
    new Chromosome("11", 19981121),
    new Chromosome("12", 20129920),
    new Chromosome("13", 17936364),
    new Chromosome("14", 15370873),
    new Chromosome("15", 12700396),
    new Chromosome("16", 1208922),
    new Chromosome("17", 10459299),
    new Chromosome("18", 11216778),
    new Chromosome("19", 10193151),
    new Chromosome("20", 14125975),
    new Chromosome("21", 6842595),
    new Chromosome("22", 4783206),
    new Chromosome("23", 6197481),
    new Chromosome("24", 6382819),
    new Chromosome("25", 3011307),
    new Chromosome("26", 5297963),
    new Chromosome("27", 6402218),
    new Chromosome("28", 4978247),
    new Chromosome("29", 361918),
    new Chromosome("30", 380481),
    new Chromosome("31", 1684341),
    new Chromosome("32", 255904),
    new Chromosome("33", 2866186),
    new Chromosome("34", 3049188),
    new Chromosome("35", 321869),
    new Chromosome("36", 162909),
    new Chromosome("37", 373902),
    new Chromosome("38", 402402),
    new Chromosome("39", 192486),
    new Chromosome("W", 9109940),
    new Chromosome("Z", 86044486),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("2:35209534-36156443");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "gene",
        genome: "GRCg7w",
    }),
];

const GRCg7w = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/GRCg7w/GRCg7w.2bit",
    annotationTracks,
};

export default GRCg7w;
