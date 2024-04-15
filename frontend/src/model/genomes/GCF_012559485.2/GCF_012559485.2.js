import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./GCF_012559485.2_MFA1912RKSv2.cytoBand.bed.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("GCF_012559485.2", [
    new Chromosome("NC_052255.1", 221970631),
    new Chromosome("NC_052256.1", 193987804),
    new Chromosome("NC_052257.1", 184905226),
    new Chromosome("NC_052258.1", 167980602),
    new Chromosome("NC_052259.1", 185896635),
    new Chromosome("NC_052260.1", 176599330),
    new Chromosome("NC_052261.1", 166634510),
    new Chromosome("NC_052262.1", 142847455),
    new Chromosome("NC_052263.1", 129235353),
    new Chromosome("NC_052264.1", 95991616),
    new Chromosome("NC_052265.1", 130228713),
    new Chromosome("NC_052266.1", 127712166),
    new Chromosome("NC_052267.1", 106988864),
    new Chromosome("NC_052268.1", 125498623),
    new Chromosome("NC_052269.1", 109914925),
    new Chromosome("NC_052270.1", 77312005),
    new Chromosome("NC_052271.1", 93574148),
    new Chromosome("NC_052272.1", 72866064),
    new Chromosome("NC_052273.1", 55294057),
    new Chromosome("NC_052274.1", 76902342),
    new Chromosome("NC_052275.1", 149803873),
]);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("NC_052257.1:97409621-97428190");

const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiRefSeq",
        genome: "GCF_012559485.2",
        label: "NCBI RefSeq genes",
    }),
    new TrackModel({
        type: "bigbed",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/GCF_012559485.2/GCF_012559485.2_MFA1912RKSv2.rmsk.bb",
    }),
];

const GCF_012559485_2 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/GCF_012559485.2/GCF_012559485.2.2bit",
    annotationTracks,
};

export default GCF_012559485_2;
