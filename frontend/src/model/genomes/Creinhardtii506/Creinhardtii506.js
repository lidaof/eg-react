import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("Creinhardtii5.6", [
    new Chromosome("chr1", 8033585),
    new Chromosome("chr2", 9223677),
    new Chromosome("chr3", 9219486),
    new Chromosome("chr4", 4091191),
    new Chromosome("chr5", 3500558),
    new Chromosome("chr6", 9023763),
    new Chromosome("chr7", 6421821),
    new Chromosome("chr8", 5033832),
    new Chromosome("chr9", 7956127),
    new Chromosome("chr10", 6576019),
    new Chromosome("chr11", 3826814),
    new Chromosome("chr12", 9730733),
    new Chromosome("chr13", 5206065),
    new Chromosome("chr14", 4157777),
    new Chromosome("chr15", 1922860),
    new Chromosome("chr16", 7783580),
    new Chromosome("chr17", 7188315),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr1:219261-260991");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "PhytozomeGene",
        genome: "Creinhardtii506",
        queryEndpoint: {
            name: "Phytozome",
            endpoint: "https://phytozome.jgi.doe.gov/phytomine/portal.do?class=Protein&externalids=",
        },
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
];

const Creinhardtii506 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/Creinhardtii506/Creinhardtii506.2bit",
    annotationTracks,
};

export default Creinhardtii506;
