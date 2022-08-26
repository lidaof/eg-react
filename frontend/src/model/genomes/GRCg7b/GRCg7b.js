import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import annotationTracks from "./annotationTracks.json";

//rename bGalGal1 to GRCg7b per https://github.com/lidaof/eg-react/issues/276#issuecomment-1211024908
const genome = new Genome("GRCg7b", [
    new Chromosome("1", 196449156),
    new Chromosome("2", 149539284),
    new Chromosome("3", 110642502),
    new Chromosome("4", 90861225),
    new Chromosome("5", 59506338),
    new Chromosome("6", 36220557),
    new Chromosome("7", 36382834),
    new Chromosome("8", 29578256),
    new Chromosome("9", 23733309),
    new Chromosome("10", 20453248),
    new Chromosome("11", 19638187),
    new Chromosome("12", 20119077),
    new Chromosome("13", 17905061),
    new Chromosome("14", 15331188),
    new Chromosome("15", 12703657),
    new Chromosome("16", 2706039),
    new Chromosome("17", 11092391),
    new Chromosome("18", 11623896),
    new Chromosome("19", 10455293),
    new Chromosome("20", 14265659),
    new Chromosome("21", 6970754),
    new Chromosome("22", 4686657),
    new Chromosome("23", 6253421),
    new Chromosome("24", 6478339),
    new Chromosome("25", 3067737),
    new Chromosome("26", 5349051),
    new Chromosome("27", 5228753),
    new Chromosome("28", 5437364),
    new Chromosome("29", 726478),
    new Chromosome("30", 755666),
    new Chromosome("31", 2457334),
    new Chromosome("32", 125424),
    new Chromosome("33", 3839931),
    new Chromosome("34", 3469343),
    new Chromosome("35", 554126),
    new Chromosome("36", 358375),
    new Chromosome("37", 157853),
    new Chromosome("38", 667312),
    new Chromosome("39", 177356),
    new Chromosome("W", 9109940),
    new Chromosome("Z", 86044486),
    new Chromosome("MT", 16784),
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
        genome: "GRCg7b",
    }),
];

const GRCg7b = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/GRCg7b/GRCg7b.2bit",
    annotationTracks,
};

export default GRCg7b;
